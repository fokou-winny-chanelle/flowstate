import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { EmailQueueService } from '../email-queue/email-queue.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FocusReportService {
  private readonly logger = new Logger(FocusReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailQueue: EmailQueueService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 17 * * 0', {
    timeZone: 'Europe/Paris',
  })
  async sendWeeklyFocusReports(): Promise<void> {
    this.logger.log('Starting weekly focus report job');

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const usersWithSessions = await this.prisma.user.findMany({
        where: {
          focusSessions: {
            some: {
              startTime: {
                gte: sevenDaysAgo,
              },
            },
          },
          isEmailVerified: true,
          deletedAt: null,
        },
        include: {
          focusSessions: {
            where: {
              startTime: {
                gte: sevenDaysAgo,
              },
            },
            include: {
              task: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`Found ${usersWithSessions.length} users with focus sessions this week`);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';

      for (const user of usersWithSessions) {
        const sessions = user.focusSessions || [];
        if (sessions.length === 0) continue;

        try {
          // Calculate total duration using actualDuration or calculate from start/end time
          const totalMinutes = sessions.reduce((sum, session) => {
            const duration = session.actualDuration || session.plannedDuration || 0;
            return sum + duration;
          }, 0);
          
          const totalHours = Math.floor(totalMinutes / 60);
          const remainingMinutes = totalMinutes % 60;

          const averageDuration = Math.round(totalMinutes / sessions.length);

          const sessionsByDay = sessions.reduce((acc, session) => {
            const day = new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'long' });
            const duration = session.actualDuration || session.plannedDuration || 0;
            acc[day] = (acc[day] || 0) + duration;
            return acc;
          }, {} as Record<string, number>);

          const mostProductiveDay = Object.entries(sessionsByDay)
            .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'N/A';

          // Calculate average focus rating if available
          const ratingsSum = sessions.reduce((sum, s) => sum + (s.focusRating || 0), 0);
          const averageRating = sessions.length > 0 
            ? (ratingsSum / sessions.length).toFixed(1) 
            : 'Not tracked';

          const topTasks = sessions
            .filter(s => s.task)
            .reduce((acc, session) => {
              const taskTitle = session.task?.title || 'Unknown';
              const duration = session.actualDuration || session.plannedDuration || 0;
              acc[taskTitle] = (acc[taskTitle] || 0) + duration;
              return acc;
            }, {} as Record<string, number>);

          const topTasksList = Object.entries(topTasks)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([task, minutes]) => `${task}: ${Math.round(minutes as number)} min`)
            .join('\n');

          await this.emailQueue.addFocusReportEmail(user.email, {
            userName: user.fullName || 'there',
            totalHours,
            totalMinutes: remainingMinutes,
            totalSessions: sessions.length,
            averageDuration,
            mostProductiveDay,
            averageMood: `${averageRating}/5`,
            topTasks: topTasksList || 'No tasks tracked',
            analyticsUrl: `${frontendUrl}/analytics`,
            settingsUrl: `${frontendUrl}/settings/notifications`,
          });
        } catch (error) {
          this.logger.error(`Failed to queue focus report for user ${user.id}`, error);
        }
      }

      this.logger.log(`Weekly focus report job completed: ${usersWithSessions.length} reports queued`);
    } catch (error) {
      this.logger.error('Weekly focus report job failed', error);
    }
  }
}

