import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ecommerce Store')
    .setDescription('REST API for the Ecommerce Store platform — storefront, cart, checkout, orders, and admin.')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addTag('auth', 'Signup, login, and current user')
    .addTag('products', 'Public product catalog — search, filter, sort, paginate')
    .addTag('cart', 'Authenticated cart management')
    .addTag('checkout', 'Transactional order creation')
    .addTag('orders', 'Customer order history')
    .addTag('suggestions', 'Personalised product recommendations')
    .addTag('admin/products', 'Admin — product CRUD')
    .addTag('admin/orders', 'Admin — order management and status transitions')
    .addTag('admin/dashboard', 'Admin — sales stats and charts')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3001);
  console.log(`API running at http://localhost:${process.env.PORT ?? 3001}/api`);
  console.log(`Swagger docs at http://localhost:${process.env.PORT ?? 3001}/docs`);
}
bootstrap();
