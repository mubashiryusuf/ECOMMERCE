import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CheckoutDto } from './dto/checkout.dto';

@ApiTags('checkout')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post()
  checkout(@CurrentUser() user: any, @Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(user.id, dto);
  }
}
