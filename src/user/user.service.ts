import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      companyId: user.companyId,
      company: user.company,
    };
  }

  async findAll(companyId: string, includeInactive: boolean = false) {
    const where: any = {
      companyId,
      deletedAt: null,
    };

    if (!includeInactive) {
      where.isActive = true;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async create(createUserDto: CreateUserDto, companyId: string) {
    // Check if user with this email already exists in the company
    const existingUser = await this.prisma.user.findFirst({
      where: {
        companyId,
        email: createUserDto.email,
        deletedAt: null,
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in your company');
    }

    // Set default password: "welcome@123"
    const defaultPassword = 'welcome@123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create user with default password and mustChangePassword flag
    // Note: isApproved defaults to false, but users created by admin should be approved
    // For now, we'll set it to true for admin-created users (they're already approved by admin)
    const user = await this.prisma.user.create({
      data: {
        companyId,
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role || 'user',
        isActive: true,
        isApproved: true, // Admin-created users are automatically approved
        mustChangePassword: true, // Force password change on first login
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      companyId: user.companyId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto, companyId: string) {
    // Verify user exists and belongs to company
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it conflicts
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailConflict = await this.prisma.user.findFirst({
        where: {
          companyId,
          email: updateUserDto.email,
          deletedAt: null,
          id: { not: id },
        },
      });

      if (emailConflict) {
        throw new ConflictException('User with this email already exists in your company');
      }
    }

    // Hash password if provided
    const updateData: any = {
      ...updateUserDto,
    };

    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Remove undefined and empty string fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined || updateData[key] === '') {
        delete updateData[key];
      }
    });

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      companyId: updatedUser.companyId,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async remove(id: string, companyId: string) {
    // Verify user exists and belongs to company
    const existingUser = await this.prisma.user.findFirst({
      where: {
        id,
        companyId,
        deletedAt: null,
      },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Prevent deleting the last admin user
    const adminCount = await this.prisma.user.count({
      where: {
        companyId,
        role: 'admin',
        deletedAt: null,
        isActive: true,
      },
    });

    if (existingUser.role === 'admin' && adminCount === 1) {
      throw new BadRequestException('Cannot delete the last admin user. Please assign another admin first.');
    }

    // Hard delete - permanently remove from database
    return this.prisma.user.delete({
      where: { id },
    });
  }
}

