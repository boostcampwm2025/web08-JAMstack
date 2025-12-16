import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { PROJECT_NAME } from '@codejam/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(port);
  console.log(`🚀 ${PROJECT_NAME} Server (NestJS) running on port ${port}`);
}
bootstrap();
