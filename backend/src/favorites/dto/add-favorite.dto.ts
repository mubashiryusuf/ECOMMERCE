import { IsMongoId } from 'class-validator';

export class AddFavoriteDto {
  @IsMongoId()
  productId: string;
}
