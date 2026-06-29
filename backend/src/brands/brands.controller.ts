import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('brands')
@Controller('brands')
export class BrandsPublicController {
  constructor(private readonly brandsService: BrandsService) {}

  @ApiOperation({ summary: 'List all brands (public)' })
  @Get()
  async listBrands() {
    const brands = await this.brandsService.listBrands();
    return brands.map((b) => b.toJSON());
  }
}

@ApiTags('admin/brands')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/brands')
export class BrandsAdminController {
  constructor(private readonly brandsService: BrandsService) {}

  @ApiOperation({ summary: 'Create a brand (admin)' })
  @Post()
  async createBrand(@Body() dto: CreateBrandDto) {
    const brand = await this.brandsService.createBrand(dto);
    return brand.toJSON();
  }

  @ApiOperation({ summary: 'Update a brand (admin)' })
  @Patch(':id')
  async updateBrand(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    const brand = await this.brandsService.updateBrand(id, dto);
    return brand.toJSON();
  }

  @ApiOperation({ summary: 'Delete a brand (admin)' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBrand(@Param('id') id: string): Promise<void> {
    await this.brandsService.deleteBrand(id);
  }
}
