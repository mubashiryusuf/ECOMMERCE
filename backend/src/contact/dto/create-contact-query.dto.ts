import { IsString, MinLength, IsEmail } from 'class-validator';

export class CreateContactQueryDto {
  @IsString() @MinLength(1) firstName: string;
  @IsString() @MinLength(1) lastName: string;
  @IsEmail() email: string;
  @IsString() @MinLength(1) subject: string;
  @IsString() @MinLength(10) message: string;
}
