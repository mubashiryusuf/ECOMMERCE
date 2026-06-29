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

  /**
   * Creates a Stripe PaymentIntent so the frontend can collect card details
   * and confirm the payment before calling POST /checkout.
   * The amount must be sent as an integer (cents) in the request body.
   */
  @ApiOperation({ summary: 'Create a Stripe PaymentIntent' })
  @Post('payment-intent')
  createPaymentIntent(@Body('amount') amount: number) {
    return this.checkoutService.createPaymentIntent(amount);
  }

  @Post()
  checkout(@CurrentUser() user: any, @Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(user.id, dto);
  }
}
