import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.name, passwordHash },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = this.signAccess({ id: user.id, email: user.email, role: user.role });
    return { token, user };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash: _omit, ...safeUser } = user;
    const token = this.signAccess({ id: user.id, email: user.email, role: user.role });
    return { token, user: safeUser };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  /**
   * Forgot-password: generates a short-lived (15 min) signed reset token.
   *
   * MOCK: In production this token would be emailed. Here it is returned in the
   * response body so the flow can be exercised without an SMTP server.
   * This is clearly documented in NOTES.md.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    // Always respond with the same message to prevent email enumeration
    if (!user) {
      return { message: 'If that email is registered you will receive a reset link.' };
    }

    const resetToken = this.jwt.sign(
      { sub: user.id, email: user.email, type: 'password-reset' },
      {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: '15m',
      },
    );

    // MOCK: return the token directly instead of sending an email
    return {
      message: 'If that email is registered you will receive a reset link.',
      // Only present in non-production environments to support testing
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

  /**
   * Reset-password: verifies the reset token and updates the password hash.
   */
  async resetPassword(dto: ResetPasswordDto) {
    let payload: { sub: string; email: string; type: string };

    try {
      payload = this.jwt.verify(dto.token, {
        secret: this.config.get<string>('jwt.secret'),
      }) as typeof payload;
    } catch {
      throw new BadRequestException('Reset token is invalid or has expired');
    }

    if (payload.type !== 'password-reset') {
      throw new BadRequestException('Reset token is invalid or has expired');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new NotFoundException('User not found');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully. Please log in with your new password.' };
  }

  private signAccess(user: { id: string; email: string; role: string }) {
    return this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
  }
}
