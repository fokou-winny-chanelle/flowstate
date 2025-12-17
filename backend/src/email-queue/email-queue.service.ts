import {
  FocusReportEmailContext,
  GoalMilestoneEmailContext,
  MailerService,
  OtpEmailContext,
  OverdueSummaryEmailContext,
  PasswordResetEmailContext,
  ProjectInvitationEmailContext,
  StreakMilestoneEmailContext,
  TaskReminderEmailContext,
  WelcomeEmailContext,
} from '@flowstate/shared/mailer';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, Optional } from '@nestjs/common';
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
  private useQueue = false;
  private queueErrorCount = 0;
  private readonly MAX_QUEUE_ERRORS = 3; // Disable queue after 3 consecutive errors

  constructor(
    @Optional() @InjectQueue('email') private emailQueue: Queue<EmailJob> | null,
    private readonly mailerService: MailerService,
  ) {
    // Check if Redis queue is available
    if (this.emailQueue) {
      this.useQueue = true;
      this.logger.log('Redis queue available - using queue for emails');
      
      // Listen for queue errors to automatically disable queue if Redis is down
      this.emailQueue.on('error', (error) => {
        this.queueErrorCount++;
        this.logger.warn(`Redis queue error (${this.queueErrorCount}/${this.MAX_QUEUE_ERRORS}):`, error);
        
        if (this.queueErrorCount >= this.MAX_QUEUE_ERRORS) {
          this.useQueue = false;
          this.logger.error(`Redis queue disabled after ${this.MAX_QUEUE_ERRORS} errors. Emails will be sent directly.`);
        }
      });
      
      // Reset error count on successful connection
      this.emailQueue.on('ready', () => {
        if (this.queueErrorCount > 0) {
          this.logger.log('Redis queue reconnected - re-enabling queue');
          this.queueErrorCount = 0;
          this.useQueue = true;
        }
      });
    } else {
      this.logger.warn('Redis queue not available - using direct email sending');
    }
  }

  async addEmailJob(job: EmailJob, priority?: number): Promise<void> {
    // Try queue only if enabled and available
    if (this.useQueue && this.emailQueue) {
      try {
        await this.emailQueue.add(job.type, job, {
          priority: priority || 10,
        });
        this.logger.log(`Email job added to queue: ${job.type} to ${job.to}`);
        this.queueErrorCount = 0; // Reset error count on success
        return;
      } catch (error) {
        this.queueErrorCount++;
        this.logger.warn(`Queue failed (${this.queueErrorCount}/${this.MAX_QUEUE_ERRORS}), falling back to direct send: ${job.type}`, error);
        
        // Disable queue after too many errors
        if (this.queueErrorCount >= this.MAX_QUEUE_ERRORS) {
          this.useQueue = false;
          this.logger.error(`Redis queue disabled after ${this.MAX_QUEUE_ERRORS} consecutive errors. All emails will be sent directly.`);
        }
        // Fall through to direct send
      }
    }
    
    // Fallback: send directly via MailerService (always works, even if queue fails)
    await this.sendEmailDirectly(job);
  }

  private async sendEmailDirectly(job: EmailJob): Promise<void> {
    try {
      switch (job.type) {
        case EmailJobType.OTP:
          await this.mailerService.sendOtpEmail(job.to, job.context as OtpEmailContext);
          break;
        case EmailJobType.WELCOME:
          await this.mailerService.sendWelcomeEmail(job.to, job.context as WelcomeEmailContext);
          break;
        case EmailJobType.PASSWORD_RESET:
          await this.mailerService.sendPasswordResetEmail(job.to, job.context as PasswordResetEmailContext);
          break;
        case EmailJobType.GOAL_MILESTONE:
          await this.mailerService.sendGoalMilestoneEmail(job.to, job.context as GoalMilestoneEmailContext);
          break;
        case EmailJobType.STREAK_MILESTONE:
          await this.mailerService.sendStreakMilestoneEmail(job.to, job.context as StreakMilestoneEmailContext);
          break;
        case EmailJobType.PROJECT_INVITATION:
          await this.mailerService.sendProjectInvitationEmail(job.to, job.context as ProjectInvitationEmailContext);
          break;
        case EmailJobType.TASK_REMINDER:
          await this.mailerService.sendTaskReminderEmail(job.to, job.context as TaskReminderEmailContext);
          break;
        case EmailJobType.OVERDUE_SUMMARY:
          await this.mailerService.sendOverdueSummaryEmail(job.to, job.context as OverdueSummaryEmailContext);
          break;
        case EmailJobType.FOCUS_REPORT:
          await this.mailerService.sendFocusReportEmail(job.to, job.context as FocusReportEmailContext);
          break;
        default:
          this.logger.error(`Unknown email job type: ${job.type}`);
          throw new Error(`Unknown email job type: ${job.type}`);
      }
      this.logger.log(`Email sent directly: ${job.type} to ${job.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email directly: ${job.type}`, error);
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

