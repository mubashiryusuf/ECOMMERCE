import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6...',
    description: 'Google ID token received from Google Sign-In on the client',
  })
  @IsString()
  @IsNotEmpty()
  credential: string;
}
