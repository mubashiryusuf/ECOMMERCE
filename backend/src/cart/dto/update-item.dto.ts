import { IsInt, Min } from 'class-validator';

export class UpdateItemDto {
  /** Set to 0 to remove the item from the cart */
  @IsInt()
  @Min(0)
  quantity: number;
}
