import {
  IsString,
  IsInt,
  IsOptional,
  IsArray,
  Min,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  /** Price in integer cents — must be at least 1 cent (no free products) */
  @IsInt()
  @Min(1)
  priceCents: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(60)
  category: string;

  @IsInt()
  @Min(0)
  stockQuantity: number;
}
