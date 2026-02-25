import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApproveUserDto } from './dto/approve-user.dto';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { companyName, email, password, firstName, lastName } = registerDto;

    // Check if company email already exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { email },
    });

    if (existingCompany) {
      throw new ConflictException('Company with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company and admin user in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          email,
        },
      });

      // Create admin user with isApproved: false (pending approval)
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'admin',
          isApproved: false, // Require admin approval
        },
      });

      return { company, user };
    });

    // Send approval request email to admin
    try {
      await this.emailService.sendApprovalRequestEmail({
        adminEmail: 'dineshemur@gmail.com',
        companyName: result.company.name,
        companyEmail: result.company.email,
        userName: `${result.user.firstName} ${result.user.lastName}`,
        userEmail: result.user.email,
        userId: result.user.id,
        companyId: result.company.id,
      });
    } catch (error) {
      console.error('Failed to send approval request email:', error);
      // Don't fail registration if email fails
    }

    // Return success message but NO token (user must wait for approval)
    return {
      message: 'Registration successful. Your account is pending approval. You will receive an email once your account is approved.',
      requiresApproval: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        companyId: result.user.companyId,
      },
      company: {
        id: result.company.id,
        name: result.company.name,
        email: result.company.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user with company
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        company: true,
      },
    });

    if (!user || !user.company || user.deletedAt || user.company.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is approved (MUST BE BEFORE TOKEN GENERATION)
    if (!user.isApproved) {
      throw new UnauthorizedException('Your account is pending approval. Please wait for admin approval before logging in.');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // If user must change password, return flag without generating token
    if (user.mustChangePassword) {
      return {
        mustChangePassword: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      access_token: token,
      mustChangePassword: false,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
      company: {
        id: user.company.id,
        name: user.company.name,
        email: user.company.email,
      },
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        isActive: user.isActive,
      },
      company: {
        id: user.company.id,
        name: user.company.name,
        email: user.company.email,
      },
    };
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { email, currentPassword, newPassword } = changePasswordDto;

    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        company: true,
      },
    });

    if (!user || !user.company || user.deletedAt || user.company.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password and set mustChangePassword to false
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false,
      },
    });

    return {
      message: 'Password changed successfully. Please login with your new password.',
    };
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    const { email } = requestPasswordResetDto;
    
    console.log('🔍 Looking up user with email:', email);

    const user = await this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        company: true,
      },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user || !user.company || user.deletedAt || user.company.deletedAt) {
      console.log('⚠️  User not found or inactive for email:', email);
      return {
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    console.log('✅ User found:', user.email, 'Company:', user.company.name);

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    console.log('🔑 Generated reset token, expires at:', expiresAt);

    try {
      // Delete any existing reset tokens for this user
      await this.prisma.passwordReset.deleteMany({
        where: { userId: user.id, used: false },
      });
      console.log('🗑️  Deleted existing reset tokens');

      // Create new reset token
      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });
      console.log('💾 Reset token saved to database');
    } catch (dbError: any) {
      console.error('❌ Database error creating reset token:', dbError.message);
      // Check if PasswordReset table exists
      if (dbError.message.includes('Unknown table') || dbError.message.includes('does not exist')) {
        console.error('⚠️  PasswordReset table does not exist! Run migration: npx prisma migrate dev');
        throw new Error('Database migration required. Please run: npx prisma migrate dev');
      }
      throw dbError;
    }

    // Send reset email
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL environment variable is required for password reset emails');
    }
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    console.log('📧 Preparing to send reset email...');
    console.log('   To:', user.email);
    console.log('   Reset URL:', resetUrl);

    try {
      const emailResult = await this.emailService.sendPasswordResetEmail(user.email, token, resetUrl);
      console.log('✅ Password reset email sent successfully to:', user.email);
      console.log('   Message ID:', emailResult.messageId || 'N/A');
    } catch (error: any) {
      console.error('❌ Failed to send password reset email:', error.message);
      console.error('   Error details:', JSON.stringify(error, null, 2));
      console.error('   User email:', user.email);
      console.error('   Reset token:', token);
      console.error('   Reset URL:', resetUrl);
      // Log the error but don't fail the request (security best practice)
      // The user will still see the success message
    }

    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Find valid reset token
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (passwordReset.used) {
      throw new BadRequestException('This reset token has already been used');
    }

    if (new Date() > passwordReset.expiresAt) {
      throw new BadRequestException('Reset token has expired');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: passwordReset.userId },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
        },
      }),
      this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true },
      }),
    ]);

    return {
      message: 'Password has been reset successfully. Please login with your new password.',
    };
  }

  async approveUser(approveUserDto: ApproveUserDto) {
    const { userId, companyId, approved } = approveUserDto;

    // Find user
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
        deletedAt: null,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Update approval status
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isApproved: approved },
    });

    // Send notification email to user
    if (approved) {
      try {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL');
        const loginUrl = frontendUrl ? `${frontendUrl}/login` : '/login';
        await this.emailService.sendNotificationEmail(
          user.email,
          'Account Approved - Construction CRM',
          `Dear ${user.firstName} ${user.lastName},\n\nYour account has been approved. You can now login to Construction CRM.\n\nLogin at: ${loginUrl}`
        );
      } catch (error) {
        console.error('Failed to send approval notification email:', error);
      }
    } else {
      try {
        await this.emailService.sendNotificationEmail(
          user.email,
          'Account Registration Declined - Construction CRM',
          `Dear ${user.firstName} ${user.lastName},\n\nUnfortunately, your registration request has been declined. Please contact support for more information.`
        );
      } catch (error) {
        console.error('Failed to send rejection notification email:', error);
      }
    }

    return {
      message: approved ? 'User approved successfully' : 'User rejected successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        isApproved: updatedUser.isApproved,
      },
    };
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}

