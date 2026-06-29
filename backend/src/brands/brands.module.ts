import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Brand, BrandSchema } from '../mongoose/schemas/brand.schema';
import { BrandsService } from './brands.service';
import { BrandsPublicController, BrandsAdminController } from './brands.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
    ]),
  ],
  providers: [BrandsService],
  controllers: [BrandsPublicController, BrandsAdminController],
  exports: [BrandsService],
})
export class BrandsModule {}
