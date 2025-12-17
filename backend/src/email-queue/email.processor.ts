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
import { OnQueueError, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailJob, EmailJobType } from './email-queue.service';

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly mailerService: MailerService) {}

  @Process(EmailJobType.OTP)
  async handleOtpEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`Processing OTP email for ${job.data.to}`);
    try {
      await this.mailerService.sendOtpEmail(
        job.data.to,
        job.data.context as unknown as OtpEmailContext,
      );
      this.logger.log(`OTP email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${job.data.to}`, error);
      throw error;
    }
  }

  @Process(EmailJobType.WELCOME)
  async handleWelcomeEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`Processing welcome email for ${job.data.to}`);
    try {
      await this.mailerService.sendWelcomeEmail(
        job.data.to,
        job.data.context as unknown as WelcomeEmailContext,
      );
      this.logger.log(`Welcome email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${job.data.to}`, error);
      throw error;
    }
  }

  @Process(EmailJobType.PASSWORD_RESET)
  async handlePasswordResetEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`Processing password reset email for ${job.data.to}`);
    try {
      await this.mailerService.sendPasswordResetEmail(
        job.data.to,
        job.data.context as unknown as PasswordResetEmailContext,
      );
      this.logger.log(`Password reset email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${job.data.to}`, error);
      throw error;
    }
  }

  @Process(EmailJobType.GOAL_MILESTONE)
  async handleGoalMilestoneEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`Processing goal milestone email for ${job.data.to}`);
    try {
      await this.mailerService.sendGoalMilestoneEmail(
        job.data.to,
        job.data.context as GoalMilestoneEmailContext,
      );
      this.logger.log(`Goal milestone email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send goal milestone email to ${job.data.to}`, error);
      throw error;
    }
  }

  @Process(EmailJobType.STREAK_MILESTONE)
  async handleStreakMilestoneEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`Processing streak milestone email for ${job.data.to}`);
    try {
      await this.mailerService.sendStreakMilestoneEmail(
        job.data.to,
        job.data.context as StreakMilestoneEmailContext,
      );
      this.logger.log(`Streak milestone email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send streak milestone email to ${job.data.to}`, error);
      throw error;
    }
  }

  @Process(EmailJobType.PROJECT_INVITATION)
  async handleProjectInvitationEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`Processing project invitation email for ${job.data.to}`);
    try {
      await this.mailerService.sendProjectInvitationEmail(
        job.data.to,
        job.data.context as ProjectInvitationEmailContext,
      );
      this.logger.log(`Project invitation email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send project invitation email to ${job.data.to}`, error);
      throw error;
    }
  }

  @Process(EmailJobType.TASK_REMINDER)
  async handleTaskReminderEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`Processing task reminder email for ${job.data.to}`);
    try {
      await this.mailerService.sendTaskReminderEmail(
        job.data.to,
        job.data.context as TaskReminderEmailContext,
      );
      this.logger.log(`Task reminder email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send task reminder email to ${job.data.to}`, error);
      throw error;
    }
  }

  @Process(EmailJobType.OVERDUE_SUMMARY)
  async handleOverdueSummaryEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`Processing overdue summary email for ${job.data.to}`);
    try {
      await this.mailerService.sendOverdueSummaryEmail(
        job.data.to,
        job.data.context as OverdueSummaryEmailContext,
      );
      this.logger.log(`Overdue summary email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send overdue summary email to ${job.data.to}`, error);
      throw error;
    }
  }

  @Process(EmailJobType.FOCUS_REPORT)
  async handleFocusReportEmail(job: Job<EmailJob>): Promise<void> {
    this.logger.log(`Processing focus report email for ${job.data.to}`);
    try {
      await this.mailerService.sendFocusReportEmail(
        job.data.to,
        job.data.context as FocusReportEmailContext,
      );
      this.logger.log(`Focus report email sent successfully to ${job.data.to}`);
    } catch (error) {
      this.logger.error(`Failed to send focus report email to ${job.data.to}`, error);
      throw error;
    }
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job<EmailJob>, error: Error): Promise<void> {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts`,
      {
        jobId: job.id,
        jobType: job.data.type,
        recipient: job.data.to,
        error: error.message,
        stack: error.stack,
      }
    );
  }

  @OnQueueError()
  async onQueueError(error: Error): Promise<void> {
    this.logger.error('Queue error occurred', {
      error: error.message,
      stack: error.stack,
    });
  }
}

