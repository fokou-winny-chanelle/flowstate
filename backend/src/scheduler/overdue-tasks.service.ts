import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailQueueService } from '../email-queue/email-queue.service';

@Injectable()
export class OverdueTasksService {
  private readonly logger = new Logger(OverdueTasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailQueue: EmailQueueService,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async sendOverdueTasksSummary(): Promise<void> {
    this.logger.log('Starting overdue tasks summary job');

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usersWithOverdueTasks = await this.prisma.user.findMany({
        where: {
          tasks: {
            some: {
              dueDate: {
                lt: today,
              },
              isCompleted: false,
              deletedAt: null,
            },
          },
          isEmailVerified: true,
          deletedAt: null,
        },
        include: {
          tasks: {
            where: {
              dueDate: {
                lt: today,
              },
              isCompleted: false,
              deletedAt: null,
            },
            orderBy: {
              dueDate: 'asc',
            },
            take: 10,
          },
        },
      });

      this.logger.log(`Found ${usersWithOverdueTasks.length} users with overdue tasks`);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';

      for (const user of usersWithOverdueTasks) {
        if (user.tasks.length === 0) continue;

        try {
          const overdueTasks = user.tasks.map((task) => {
            const daysOverdue = Math.floor(
              (today.getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24),
            );
            return `${task.title} - ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`;
          }).join('\n');

          await this.emailQueue.addOverdueSummaryEmail(user.email, {
            userName: user.fullName || 'there',
            overdueCount: user.tasks.length,
            overdueTasks,
            reviewUrl: `${frontendUrl}/tasks?filter=overdue`,
            settingsUrl: `${frontendUrl}/settings/notifications`,
          });
        } catch (error) {
          this.logger.error(`Failed to queue overdue summary for user ${user.id}`, error);
        }
      }

      this.logger.log(`Overdue tasks summary job completed: ${usersWithOverdueTasks.length} summaries queued`);
    } catch (error) {
      this.logger.error('Overdue tasks summary job failed', error);
    }
  }
}

