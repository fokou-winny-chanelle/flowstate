import { Controller, Get } from '@nestjs/common';
import { FocusReportService } from './focus-report.service';
import { OverdueTasksService } from './overdue-tasks.service';
import { TaskReminderService } from './task-reminder.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(
    private readonly taskReminderService: TaskReminderService,
    private readonly overdueTasksService: OverdueTasksService,
    private readonly focusReportService: FocusReportService,
  ) {}

  @Get('test/task-reminders')
  async testTaskReminders() {
    await this.taskReminderService.sendTaskReminders();
    return { 
      message: 'Task reminders executed manually', 
      timestamp: new Date().toISOString() 
    };
  }

  @Get('test/overdue-summary')
  async testOverdueSummary() {
    await this.overdueTasksService.sendOverdueTasksSummary();
    return { 
      message: 'Overdue summary executed manually', 
      timestamp: new Date().toISOString() 
    };
  }

  @Get('test/focus-report')
  async testFocusReport() {
    await this.focusReportService.sendWeeklyFocusReports();
    return { 
      message: 'Focus report executed manually', 
      timestamp: new Date().toISOString() 
    };
  }

  @Get('status')
  getStatus() {
    return {
      schedulers: [
        {
          name: 'Task Reminders',
          schedule: 'Daily at 9:00 AM',
          cron: '0 9 * * *',
          status: 'active',
        },
        {
          name: 'Overdue Tasks Summary',
          schedule: 'Daily at 7:00 AM',
          cron: '0 7 * * *',
          status: 'active',
        },
        {
          name: 'Weekly Focus Report',
          schedule: 'Sundays at 5:00 PM',
          cron: '0 17 * * 0',
          status: 'active',
        },
      ],
      message: 'All schedulers are running automatically',
    };
  }
}

