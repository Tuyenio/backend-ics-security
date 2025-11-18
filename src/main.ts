import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import dataSource from './data-source';

async function bootstrap() {
  // Chạy migrations tự động khi start backend
  try {
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    const pendingMigrations = await dataSource.showMigrations();
    if (pendingMigrations) {
      console.log('🔄 Đang chạy migrations...');
      await dataSource.runMigrations();
      console.log('✅ Migrations đã hoàn tất!');
    } else {
      console.log('✅ Database đã được cập nhật!');
    }
    await dataSource.destroy();
  } catch (error) {
    console.log('ℹ️  Migrations: ', error.message);
  }

  const app = await NestFactory.create(AppModule);

  // Cấu hình CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Cấu hình validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cấu hình prefix cho API
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend đang chạy tại: http://localhost:${port}/api`);
}
bootstrap();
