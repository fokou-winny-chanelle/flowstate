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
        
        if (redisUrl && redisUrl.trim() !== '') {
          // Parse Redis URL (format: redis://[user:password@]host:port[/db])
          // Example: redis://red-xxxxx:6379 or redis://user:pass@red-xxxxx:6379
          try {
            const url = new URL(redisUrl);
            const hostname = url.hostname;
            const port = url.port ? parseInt(url.port, 10) : 6379;
            
            console.log(`[Redis Config] Parsed REDIS_URL: host=${hostname}, port=${port}`);
            
            const redisConfig: any = {
              host: hostname,
              port: port,
              retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
              },
              maxRetriesPerRequest: 3,
            };
            
            // Add password if provided in URL
            if (url.password) {
              redisConfig.password = url.password;
              console.log('[Redis Config] Password found in URL');
            }
            
            // Add username if provided (usually not needed for Render)
            if (url.username && !url.password) {
              // Some Redis URLs have username without password
              redisConfig.username = url.username;
            }
            
            return {
              redis: redisConfig,
              defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 1000,
              },
            };
          } catch (error) {
            // If URL parsing fails, fall back to host/port format
            console.error('[Redis Config] Failed to parse REDIS_URL:', redisUrl, error);
            console.log('[Redis Config] Falling back to REDIS_HOST/REDIS_PORT');
          }
        }
        
        // Fallback to host/port format (local development or Docker)
        const redisHost = configService.get<string>('REDIS_HOST') || 'localhost';
        const redisPort = configService.get<number>('REDIS_PORT') || 6379;
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        
        console.log(`[Redis Config] Using REDIS_HOST/REDIS_PORT: host=${redisHost}, port=${redisPort}`);
        
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
          console.log('[Redis Config] Password found in REDIS_PASSWORD');
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
