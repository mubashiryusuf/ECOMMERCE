import { Module } from '@nestjs/common';
import { AdminProductsController } from './products/admin-products.controller';
import { AdminProductsService } from './products/admin-products.service';
import { AdminOrdersController } from './orders/admin-orders.controller';
import { AdminOrdersService } from './orders/admin-orders.service';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { AdminDashboardService } from './dashboard/admin-dashboard.service';

@Module({
  controllers: [
    AdminProductsController,
    AdminOrdersController,
    AdminDashboardController,
  ],
  providers: [
    AdminProductsService,
    AdminOrdersService,
    AdminDashboardService,
  ],
})
export class AdminModule {}
