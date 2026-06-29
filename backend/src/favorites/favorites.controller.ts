import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('favorites')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('me/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @ApiOperation({ summary: 'Get all favorited products for the current user' })
  @Get()
  getFavorites(@CurrentUser() user: any) {
    return this.favoritesService.getFavorites(user.id);
  }

  @ApiOperation({ summary: 'Add a product to favorites' })
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async addFavorite(@CurrentUser() user: any, @Body() dto: AddFavoriteDto) {
    await this.favoritesService.addFavorite(user.id, dto);
  }

  @ApiOperation({ summary: 'Remove a product from favorites' })
  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFavorite(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    await this.favoritesService.removeFavorite(user.id, productId);
  }
}
