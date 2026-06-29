import { IsIn } from 'class-validator';

export class UpdateContactQueryStatusDto {
  @IsIn(['NEW', 'REVIEWED']) status: string;
}
