import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'jane@example.com',
    description: 'Email address of the account to reset',
  })
  @IsEmail()
  email: string;
}
