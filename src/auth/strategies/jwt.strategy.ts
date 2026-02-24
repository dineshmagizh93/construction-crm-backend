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
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
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

    if (!user || user.deletedAt || !user.isActive || !user.isApproved || !user.company || user.company.deletedAt) {
      throw new UnauthorizedException('User not found, inactive, or not approved');
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

