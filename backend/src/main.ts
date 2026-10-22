import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para el frontend Angular (equivalente a CorsConfig/SecurityConfig en Spring)
  app.enableCors({
    origin: ['http://localhost:4200'],
    credentials: true,
  });

  // Valida y transforma automaticamente los DTO de entrada (equivalente a @Valid en Spring)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Manejo global de errores (equivalente a GlobalExceptionHandler)
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 8080;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`AmatiClinic backend (NestJS) escuchando en http://localhost:${port}`);
}
bootstrap();
