import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,     // удаляет поля, которых нет в dto
    forbidNonWhitelisted: true, // бросает ошибку, если в теле запроса есть лишние поля
    transform: true,     // автоматически приводит payload к типу DTO
  }));

  await app.listen(4000);
}
bootstrap();