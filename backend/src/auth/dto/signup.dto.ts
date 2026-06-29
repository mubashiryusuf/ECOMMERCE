import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'jane@example.com',
    description: 'Unique email address for the new account',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Display name (minimum 2 characters)',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'Str0ng!Pass',
    description: 'Password (minimum 8 characters)',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
