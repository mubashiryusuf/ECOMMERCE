import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { Cart, CartSchema } from '../mongoose/schemas/cart.schema';
import { Product, ProductSchema } from '../mongoose/schemas/product.schema';
import { Order, OrderSchema } from '../mongoose/schemas/order.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  providers: [CheckoutService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
