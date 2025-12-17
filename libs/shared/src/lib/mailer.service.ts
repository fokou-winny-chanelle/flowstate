import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import mjml2html from 'mjml';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  context?: Record<string, unknown>;
}

export interface OtpEmailContext {
  otpCode: string;
  expiresIn?: string;
}

export interface WelcomeEmailContext {
  name: string;
}

export interface PasswordResetEmailContext {
  otpCode: string;
  expiresIn?: string;
}

export interface GoalMilestoneEmailContext extends Record<string, unknown> {
  userName: string;
  goalName: string;
  progress: number;
  completedTasks: number;
  totalTasks: number;
  recentTasks: string;
  goalUrl: string;
  settingsUrl: string;
}

export interface StreakMilestoneEmailContext extends Record<string, unknown> {
  userName: string;
  habitName: string;
  streakDays: number;
  bestStreak: number;
  frequency: string;
  startDate: string;
  habitUrl: string;
  settingsUrl: string;
}

export interface ProjectInvitationEmailContext extends Record<string, unknown> {
  inviteeName: string;
  inviterName: string;
  projectName: string;
  projectDescription: string;
  role: string;
  progress: number;
  deadline: string;
  acceptUrl: string;
}

export interface TaskReminderEmailContext extends Record<string, unknown> {
  userName: string;
  taskTitle: string;
  projectName: string;
  priority: string;
  estimatedTime: number;
  taskUrl: string;
  settingsUrl: string;
}

export interface OverdueSummaryEmailContext extends Record<string, unknown> {
  userName: string;
  overdueCount: number;
  overdueTasks: string;
  reviewUrl: string;
  settingsUrl: string;
}

export interface FocusReportEmailContext extends Record<string, unknown> {
  userName: string;
  totalHours: number;
  totalMinutes: number;
  totalSessions: number;
  averageDuration: number;
  mostProductiveDay: string;
  averageMood: string;
  topTasks: string;
  analyticsUrl: string;
  settingsUrl: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly appUrl: string;
  
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private configService: ConfigService) {
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailAppPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');
    
    if (!gmailUser || !gmailAppPassword) {
      this.logger.warn('GMAIL_USER or GMAIL_APP_PASSWORD not found. Email service will not work.');
    }
    
    // Initialize Nodemailer with Gmail SMTP
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      connectionTimeout: 60000, // 60 seconds
      greetingTimeout: 30000, // 30 seconds
      socketTimeout: 60000, // 60 seconds
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
    
    this.fromEmail = gmailUser || 'noreply@example.com';
    this.fromName = this.configService.get<string>('APP_NAME') || 'FlowState';
    this.appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    
    // Verify SMTP connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP connection failed:', error);
      } else {
        this.logger.log('SMTP server ready to send emails');
      }
    });
  }

  private getTemplatePath(templateName: string): string {
    const possiblePaths = [
      path.join(process.cwd(), 'libs', 'shared', 'src', 'lib', 'templates', `${templateName}.mjml`),
      path.join(__dirname, 'templates', `${templateName}.mjml`),
      path.join(process.cwd(), 'dist', 'libs', 'shared', 'src', 'lib', 'templates', `${templateName}.mjml`),
    ];

    for (const templatePath of possiblePaths) {
      if (fs.existsSync(templatePath)) {
        return templatePath;
      }
    }

    throw new Error(`Template ${templateName} not found in any of the expected paths`);
  }

  private async loadTemplate(templateName: string): Promise<string> {
    try {
      const templatePath = this.getTemplatePath(templateName);
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  private compileTemplate(
    templateContent: string,
    context: Record<string, unknown>,
  ): string {
    const compiled = handlebars.compile(templateContent);
    return compiled(context);
  }

  private mjmlToHtml(mjmlContent: string): string {
    const { html, errors } = mjml2html(mjmlContent, {
      validationLevel: 'soft',
    });

    if (errors && errors.length > 0) {
      this.logger.warn('MJML compilation warnings:', errors);
    }

    return html;
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      let templateContent = await this.loadTemplate(options.template);

      const context = {
        ...options.context,
        appUrl: this.appUrl,
      };

      templateContent = this.compileTemplate(templateContent, context);

      const html = this.mjmlToHtml(templateContent);

      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: recipients.join(', '),
        subject: options.subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(
        `Email sent successfully to ${recipients.join(', ')}. Message ID: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email via Gmail SMTP:`, error);
      throw new Error('Failed to send email');
    }
  }

  async sendOtpEmail(to: string, context: OtpEmailContext): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'FlowState - Your Verification Code',
      template: 'otp',
      context: {
        otpCode: context.otpCode,
        expiresIn: context.expiresIn || '10 minutes',
      },
    });
  }

  async sendWelcomeEmail(to: string, context: WelcomeEmailContext): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to FlowState!',
      template: 'welcome',
      context: {
        name: context.name,
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    context: PasswordResetEmailContext,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'FlowState - Password Reset Code',
      template: 'password-reset',
      context: {
        otpCode: context.otpCode,
        expiresIn: context.expiresIn || '10 minutes',
      },
    });
  }

  async sendGoalMilestoneEmail(
    to: string,
    context: GoalMilestoneEmailContext,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `Milestone reached! 🎉 ${context.goalName} is ${context.progress}% complete`,
      template: 'goal-milestone',
      context,
    });
  }

  async sendStreakMilestoneEmail(
    to: string,
    context: StreakMilestoneEmailContext,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `🔥 ${context.streakDays}-day streak! You're on fire!`,
      template: 'streak-milestone',
      context,
    });
  }

  async sendProjectInvitationEmail(
    to: string,
    context: ProjectInvitationEmailContext,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `${context.inviterName} invited you to "${context.projectName}" on FlowState`,
      template: 'project-invitation',
      context,
    });
  }

  async sendTaskReminderEmail(
    to: string,
    context: TaskReminderEmailContext,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `⏰ Reminder: "${context.taskTitle}" is due tomorrow`,
      template: 'task-reminder',
      context,
    });
  }

  async sendOverdueSummaryEmail(
    to: string,
    context: OverdueSummaryEmailContext,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `⚠️ You have ${context.overdueCount} overdue task${context.overdueCount > 1 ? 's' : ''}`,
      template: 'overdue-summary',
      context,
    });
  }

  async sendFocusReportEmail(
    to: string,
    context: FocusReportEmailContext,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: `📊 Your Weekly Focus Report - ${context.totalHours}h ${context.totalMinutes}m this week!`,
      template: 'focus-report',
      context,
    });
  }
}

