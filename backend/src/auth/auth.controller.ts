import { Controller, Post, Get, Body, UseGuards, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new CUSTOMER account' })
  @ApiBody({ type: SignupDto })
  @ApiResponse({
    status: 201,
    description: 'Account created — returns JWT token and user profile',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'clxyz123',
          email: 'jane@example.com',
          name: 'Jane Doe',
          role: 'CUSTOMER',
          createdAt: '2026-06-29T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  @ApiResponse({ status: 400, description: 'Validation error — check request body' })
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful — returns JWT token and user profile',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'clxyz123',
          email: 'jane@example.com',
          name: 'Jane Doe',
          role: 'CUSTOMER',
          createdAt: '2026-06-29T10:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Validation error — check request body' })
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the currently authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user profile (passwordHash never returned)',
    schema: {
      example: {
        id: 'clxyz123',
        email: 'jane@example.com',
        name: 'Jane Doe',
        role: 'CUSTOMER',
        createdAt: '2026-06-29T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid Bearer token' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: any) {
    return this.authService.me(user.id);
  }

  @ApiOperation({
    summary: 'Request a password-reset token',
    description:
      '**MOCK mode:** In production the reset link would be emailed. ' +
      'In non-production environments the `resetToken` is returned directly in the ' +
      'response body so the flow can be tested without an SMTP server. ' +
      'Use the returned token as the `token` field in `POST /auth/reset-password`.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Reset token generated (non-prod: token returned in body; prod: emailed only)',
    schema: {
      example: {
        message: 'If that email is registered you will receive a reset link.',
        resetToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (15-min expiry)',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error — must be a valid email' })
  @HttpCode(200)
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiOperation({
    summary: 'Reset password using the token from forgot-password',
    description:
      'Paste the `resetToken` from `POST /auth/forgot-password` into the `token` field. ' +
      'The token is valid for **15 minutes** and can only be used once.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password updated — log in again with the new password',
    schema: {
      example: {
        message: 'Password updated successfully. Please log in with your new password.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Token is invalid or has expired' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @HttpCode(200)
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiOperation({ summary: 'Authenticate with a Google ID token' })
  @ApiBody({ type: GoogleAuthDto })
  @ApiResponse({
    status: 200,
    description: 'Authenticated — returns JWT token and user profile (creates account on first sign-in)',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 'clxyz123', email: 'user@gmail.com', name: 'John Doe', role: 'CUSTOMER', createdAt: '2026-06-29T10:00:00.000Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid Google token' })
  @ApiResponse({ status: 400, description: 'Google OAuth not configured on server' })
  @HttpCode(200)
  @Post('google')
  googleAuth(@Body() dto: GoogleAuthDto) {
    return this.authService.googleAuth(dto);
  }
}
