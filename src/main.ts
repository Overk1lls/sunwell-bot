import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await NestFactory.createApplicationContext(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error'] : ['debug'],
  });
}

bootstrap().catch(console.error);
