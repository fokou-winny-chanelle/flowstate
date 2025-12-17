import { MailerModule } from '@flowstate/shared/mailer';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { EmailQueueService } from './email-queue.service';
import { EmailProcessor } from './email.processor';

// Conditionally register Bull queue only if Redis is available
// Check both REDIS_URL (Render format) and REDIS_HOST (local/Docker format)
const redisAvailable = 
  (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== '') ||
  (process.env.REDIS_HOST && process.env.REDIS_HOST.trim() !== '');

@Module({
  imports: [
    // Only register Bull queue if Redis is configured
    ...(redisAvailable
      ? [
          BullModule.registerQueue({
            name: 'email',
            defaultJobOptions: {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
              removeOnComplete: true,
              removeOnFail: false,
            },
          }),
        ]
      : []),
    MailerModule,
  ],
  providers: [
    EmailQueueService,
    // Only register EmailProcessor if Redis is available (it needs the queue)
    ...(redisAvailable ? [EmailProcessor] : []),
  ],
  exports: [EmailQueueService],
})
export class EmailQueueModule {}

