import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';

export enum EmailJobType {
  OTP = 'otp',
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password-reset',
  GOAL_MILESTONE = 'goal-milestone',
  STREAK_MILESTONE = 'streak-milestone',
  PROJECT_INVITATION = 'project-invitation',
  TASK_REMINDER = 'task-reminder',
  OVERDUE_SUMMARY = 'overdue-summary',
  FOCUS_REPORT = 'focus-report',
}

export interface EmailJob {
  type: EmailJobType;
  to: string;
  context: Record<string, unknown>;
}

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue<EmailJob>) {}

  async addEmailJob(job: EmailJob, priority?: number): Promise<void> {
    try {
      await this.emailQueue.add(job.type, job, {
        priority: priority || 10,
      });
      this.logger.log(`Email job added: ${job.type} to ${job.to}`);
    } catch (error) {
      this.logger.error(`Failed to add email job: ${job.type}`, error);
      throw error;
    }
  }

  async addOtpEmail(to: string, context: { otpCode: string; expiresIn?: string }): Promise<void> {
    await this.addEmailJob({
      type: EmailJobType.OTP,
      to,
      context,
    }, 1); // High priority
  }

  async addWelcomeEmail(to: string, context: { name: string }): Promise<void> {
    await this.addEmailJob({
      type: EmailJobType.WELCOME,
      to,
      context,
    }, 5); // Medium priority
  }

  async addPasswordResetEmail(to: string, context: { otpCode: string; expiresIn?: string }): Promise<void> {
    await this.addEmailJob({
      type: EmailJobType.PASSWORD_RESET,
      to,
      context,
    }, 1); // High priority
  }

  async addGoalMilestoneEmail(to: string, context: Record<string, unknown>): Promise<void> {
    await this.addEmailJob({
      type: EmailJobType.GOAL_MILESTONE,
      to,
      context,
    }, 10); // Low priority
  }

  async addStreakMilestoneEmail(to: string, context: Record<string, unknown>): Promise<void> {
    await this.addEmailJob({
      type: EmailJobType.STREAK_MILESTONE,
      to,
      context,
    }, 10); // Low priority
  }

  async addProjectInvitationEmail(to: string, context: Record<string, unknown>): Promise<void> {
    await this.addEmailJob({
      type: EmailJobType.PROJECT_INVITATION,
      to,
      context,
    }, 5); // Medium priority
  }

  async addTaskReminderEmail(to: string, context: Record<string, unknown>): Promise<void> {
    await this.addEmailJob({
      type: EmailJobType.TASK_REMINDER,
      to,
      context,
    }, 5); // Medium priority
  }

  async addOverdueSummaryEmail(to: string, context: Record<string, unknown>): Promise<void> {
    await this.addEmailJob({
      type: EmailJobType.OVERDUE_SUMMARY,
      to,
      context,
    }, 5); // Medium priority
  }

  async addFocusReportEmail(to: string, context: Record<string, unknown>): Promise<void> {
    await this.addEmailJob({
      type: EmailJobType.FOCUS_REPORT,
      to,
      context,
    }, 10); // Low priority
  }
}

