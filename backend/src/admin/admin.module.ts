import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminProductsController } from './products/admin-products.controller';
import { AdminProductsService } from './products/admin-products.service';
import { AdminOrdersController } from './orders/admin-orders.controller';
import { AdminOrdersService } from './orders/admin-orders.service';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { AdminDashboardService } from './dashboard/admin-dashboard.service';
import { AdminUploadController } from './upload/admin-upload.controller';
import { Product, ProductSchema } from '../mongoose/schemas/product.schema';
import { Order, OrderSchema } from '../mongoose/schemas/order.schema';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AdminProductsController, AdminOrdersController, AdminDashboardController, AdminUploadController],
  providers: [AdminProductsService, AdminOrdersService, AdminDashboardService],
})
export class AdminModule {}
