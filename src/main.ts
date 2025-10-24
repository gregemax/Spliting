import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Split Payment API')
    .setDescription('API for managing payments and orders with Paycrest integration')
    .setVersion('1.0')
    .addTag('payments', 'Payment management endpoints')
    .addTag('orders', 'Order management endpoints')
    .addTag('currencies', 'Currency and token management')
    .addTag('institutions', 'Institution management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe(
  ));
  app.enableCors(

  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
