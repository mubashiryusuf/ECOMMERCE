import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec();
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash,
      role: 'CUSTOMER',
    });

    const safeUser = this.toSafeUser(user);
    const token = this.signAccess(safeUser);
    return { token, user: safeUser };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec();
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const safeUser = this.toSafeUser(user);
    const token = this.signAccess(safeUser);
    return { token, user: safeUser };
  }

  async me(userId: string) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) return null;
    return this.toSafeUser(user);
  }

  /**
   * Forgot-password: generates a short-lived (15 min) signed reset token.
   *
   * MOCK: In production this token would be emailed. Here it is returned in the
   * response body so the flow can be exercised without an SMTP server.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() }).exec();

    if (!user) {
      return { message: 'If that email is registered you will receive a reset link.' };
    }

    const resetToken = this.jwt.sign(
      { sub: user._id.toString(), email: user.email, type: 'password-reset' },
      {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: '15m',
      },
    );

    return {
      message: 'If that email is registered you will receive a reset link.',
      resetToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
    };
  }

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

    const user = await this.userModel.findById(payload.sub).exec();
    if (!user) throw new NotFoundException('User not found');

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await user.save();

    return { message: 'Password updated successfully. Please log in with your new password.' };
  }

  async googleAuth(dto: GoogleAuthDto) {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Google OAuth is not configured on this server');
    }

    const client = new OAuth2Client(clientId);
    let ticket;
    try {
      ticket = await client.verifyIdToken({ idToken: dto.credential, audience: clientId });
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }

    const googlePayload = ticket.getPayload();
    if (!googlePayload?.email) {
      throw new UnauthorizedException('Could not retrieve email from Google token');
    }

    const { email, name, sub: googleId } = googlePayload;
    const normalizedEmail = email.toLowerCase();

    let user = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (!user) {
      const randomHash = await bcrypt.hash(`google_${googleId}_${email}`, 10);
      user = await this.userModel.create({
        email: normalizedEmail,
        name: name ?? email.split('@')[0],
        passwordHash: randomHash,
        role: 'CUSTOMER',
      });
    }

    const safeUser = this.toSafeUser(user);
    const token = this.signAccess(safeUser);
    return { token, user: safeUser };
  }

  private toSafeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private signAccess(user: { id: string; email: string; role: string }) {
    return this.jwt.sign({ sub: user.id, email: user.email, role: user.role });
  }
}
