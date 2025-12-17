import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksModule } from '../tasks/tasks.module';
import { AuthModule } from '../auth/auth.module';
import { ProjectsModule } from '../projects/projects.module';
import { GoalsModule } from '../goals/goals.module';
import { HabitsModule } from '../habits/habits.module';
import { FocusSessionsModule } from '../focus-sessions/focus-sessions.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { HealthModule } from '../health/health.module';
import { HttpExceptionFilter } from '../core/filters/http-exception.filter';
import { validationSchema } from '../config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST') || 'localhost';
        const redisPort = configService.get<number>('REDIS_PORT') || 6379;
        
        return {
          redis: {
            host: redisHost,
            port: redisPort,
            retryStrategy: (times: number) => {
              const delay = Math.min(times * 50, 2000);
              return delay;
            },
            maxRetriesPerRequest: 3,
          },
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
