import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from '../auth/auth.module';
import { validationSchema } from '../config/env.validation';
import { HttpExceptionFilter } from '../core/filters/http-exception.filter';
import { EmailQueueModule } from '../email-queue/email-queue.module';
import { FocusSessionsModule } from '../focus-sessions/focus-sessions.module';
import { GoalsModule } from '../goals/goals.module';
import { HabitsModule } from '../habits/habits.module';
import { HealthModule } from '../health/health.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { TasksModule } from '../tasks/tasks.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Support both REDIS_URL (Render format) and REDIS_HOST/REDIS_PORT (local/Docker)
        const redisUrl = configService.get<string>('REDIS_URL');
        
        if (redisUrl) {
          // Use Redis URL if provided (Render.com format: redis://host:port or redis://user:pass@host:port)
          return {
            redis: redisUrl,
            retryStrategy: (times: number) => {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
            maxRetriesPerRequest: 3,
            defaultJobOptions: {
              removeOnComplete: 100,
              removeOnFail: 1000,
            },
          };
        }
        
        // Fallback to host/port format (local development or Docker)
        const redisHost = configService.get<string>('REDIS_HOST') || 'localhost';
        const redisPort = configService.get<number>('REDIS_PORT') || 6379;
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        
        const redisConfig: any = {
          host: redisHost,
          port: redisPort,
          retryStrategy: (times: number) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          maxRetriesPerRequest: 3,
        };
        
        // Add password if provided
        if (redisPassword) {
          redisConfig.password = redisPassword;
        }
        
        return {
          redis: redisConfig,
          defaultJobOptions: {
            removeOnComplete: 100,
            removeOnFail: 1000,
          },
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 3600000,
        limit: 1000,
      },
    ]),
    PrismaModule,
    EmailQueueModule,
    SchedulerModule,
    HealthModule,
    AuthModule,
    TasksModule,
    ProjectsModule,
    GoalsModule,
    HabitsModule,
    FocusSessionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
