import { IsString, IsInt, IsUrl, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  /** Price in integer cents — never float */
  @IsInt()
  @Min(0)
  priceCents: number;

  @IsUrl()
  imageUrl: string;

  @IsString()
  category: string;

  @IsInt()
  @Min(0)
  stockQuantity: number;
}
