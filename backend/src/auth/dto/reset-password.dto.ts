import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Reset token received from POST /auth/forgot-password (valid for 15 minutes)',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'NewStr0ng!Pass',
    description: 'New password (minimum 8 characters)',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
