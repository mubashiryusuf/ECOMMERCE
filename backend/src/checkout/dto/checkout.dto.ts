import { IsString, MinLength } from 'class-validator';

export class CheckoutDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  addressLine1: string;

  @IsString()
  @MinLength(2)
  city: string;

  @IsString()
  @MinLength(2)
  postalCode: string;

  @IsString()
  @MinLength(2)
  country: string;
}
