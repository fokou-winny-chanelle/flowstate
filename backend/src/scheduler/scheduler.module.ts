import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailQueueModule } from '../email-queue/email-queue.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FocusReportService } from './focus-report.service';
import { OverdueTasksService } from './overdue-tasks.service';
import { TaskReminderService } from './task-reminder.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    EmailQueueModule,
  ],
  providers: [
    TaskReminderService,
    OverdueTasksService,
    FocusReportService,
  ],
})
export class SchedulerModule {}

