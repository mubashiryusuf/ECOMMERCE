import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'List all categories (public)' })
  @Get()
  async findAll() {
    const categories = await this.categoriesService.findAll();
    return categories.map((c) => c.toJSON());
  }
}
