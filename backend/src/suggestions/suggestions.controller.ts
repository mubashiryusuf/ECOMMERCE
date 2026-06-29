import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SuggestionsService } from './suggestions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('suggestions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('me')
export class SuggestionsController {
  constructor(private suggestionsService: SuggestionsService) {}

  @Get('suggestions')
  getSuggestions(@CurrentUser() user: any) {
    return this.suggestionsService.getSuggestions(user.id);
  }
}
