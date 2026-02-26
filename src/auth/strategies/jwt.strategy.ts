import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new Error(
        'JWT_SECRET environment variable is required. Please set it in your environment variables.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    // Verify user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        company: true,
      },
    });

    // Note: Approval check removed - users are auto-approved on registration
    // If you need to re-enable approval, add !user.isApproved to the condition below
    if (!user || user.deletedAt || !user.isActive || !user.company || user.company.deletedAt) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      userId: user.id,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
      company: user.company,
    };
  }
}

