/**
 * FlowState Backend API
 * Production-ready NestJS application with Swagger documentation
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.use(helmet());

  // CORS configuration - use CORS_ORIGINS env variable or default to common development origins
  // CORS_ORIGINS can be a comma-separated list: "http://localhost,http://localhost:4200,https://example.com"
  const corsOriginsEnv = process.env.CORS_ORIGINS;
  const allowedOrigins = corsOriginsEnv
    ? corsOriginsEnv.split(',').map(origin => origin.trim()).filter(Boolean)
    : [
        process.env.FRONTEND_URL || 'http://localhost:4200',
        'http://localhost',
        'http://localhost:4200',
      ].filter((origin, index, self) => self.indexOf(origin) === index); // Remove duplicates

  Logger.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        Logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  const config = new DocumentBuilder()
    .setTitle('FlowState API')
    .setDescription('The calm place for your busy mind - Backend API Documentation')
    .setVersion('1.0')
    .addTag('health', 'Health check endpoint')
    .addTag('auth', 'Authentication endpoints')
    .addTag('tasks', 'Task management endpoints')
    .addTag('projects', 'Project management endpoints')
    .addTag('goals', 'Goals tracking endpoints')
    .addTag('habits', 'Habits tracking endpoints')
    .addTag('focus-sessions', 'Focus sessions and analytics endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  Logger.log(
    `Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `Swagger documentation available at: http://localhost:${port}/api/docs`
  );
}

bootstrap();
