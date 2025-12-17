import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailQueueService } from '../email-queue/email-queue.service';

@Injectable()
export class TaskReminderService {
  private readonly logger = new Logger(TaskReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailQueue: EmailQueueService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendTaskReminders(): Promise<void> {
    this.logger.log('Starting task reminder job');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const tasks = await this.prisma.task.findMany({
        where: {
          dueDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
          },
          isCompleted: false,
          deletedAt: null,
        },
        include: {
          user: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      });

      this.logger.log(`Found ${tasks.length} tasks due tomorrow`);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';

      for (const task of tasks) {
        try {
          await this.emailQueue.addTaskReminderEmail(task.user.email, {
            userName: task.user.fullName || 'there',
            taskTitle: task.title,
            projectName: task.project?.name || 'Personal',
            priority: task.priority,
            estimatedTime: task.estimatedDuration || 0,
            taskUrl: `${frontendUrl}/tasks/${task.id}`,
            settingsUrl: `${frontendUrl}/settings/notifications`,
          });
        } catch (error) {
          this.logger.error(`Failed to queue reminder for task ${task.id}`, error);
        }
      }

      this.logger.log(`Task reminder job completed: ${tasks.length} reminders queued`);
    } catch (error) {
      this.logger.error('Task reminder job failed', error);
    }
  }
}

