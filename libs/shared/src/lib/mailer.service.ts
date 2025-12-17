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
  private currentSmtpPort: number = 465; // Track current port for retry logic
  
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private configService: ConfigService) {
    const gmailUser = this.configService.get<string>('GMAIL_USER');
    const gmailAppPassword = this.configService.get<string>('GMAIL_APP_PASSWORD');
    
    if (!gmailUser || !gmailAppPassword) {
      this.logger.warn('GMAIL_USER or GMAIL_APP_PASSWORD not found. Email service will not work.');
    }
    
    // Initialize Nodemailer with Gmail SMTP
    // Try port 465 (SSL) first, fallback to 587 (TLS) if needed
    const smtpConfig: any = {
      host: 'smtp.gmail.com',
      port: 465, // Use SSL port (more reliable for cloud providers)
      secure: true, // true for 465, false for other ports
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
      connectionTimeout: 120000, // 120 seconds (2 minutes)
      greetingTimeout: 60000, // 60 seconds
      socketTimeout: 120000, // 120 seconds
      tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
      },
      // Retry configuration
      pool: false, // Don't use connection pooling (can cause issues with Gmail)
      maxConnections: 1,
      maxMessages: 1,
    };
    
    this.transporter = nodemailer.createTransport(smtpConfig);
    
    this.fromEmail = gmailUser || 'noreply@example.com';
    this.fromName = this.configService.get<string>('APP_NAME') || 'FlowState';
    this.appUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    
    // Verify SMTP connection asynchronously (non-blocking)
    // Don't block application startup if SMTP verification fails
    // Emails will still be attempted when sendMail() is called
    this.transporter.verify((error) => {
      if (error) {
        this.logger.warn('SMTP verification failed (emails will still be attempted):', error.message);
        this.logger.warn('This is often normal on cloud providers. Emails will be sent when needed.');
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
    let retries = 3;
    let lastError: Error | null = null;
    
    while (retries > 0) {
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

        // Try sending with current transporter
        const info = await this.transporter.sendMail(mailOptions);

        this.logger.log(
          `Email sent successfully to ${recipients.join(', ')}. Message ID: ${info.messageId}`,
        );
        return; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        retries--;
        
          // If it's a connection error and we have retries left, try recreating transporter
        if (retries > 0 && (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ESOCKET')) {
          this.logger.warn(`SMTP send failed (${error.code}), retrying... (${retries} attempts left)`);
          
          // Recreate transporter with TLS port as fallback
          if (this.currentSmtpPort === 465) {
            this.logger.log('Retrying with port 587 (TLS) instead of 465 (SSL)');
            this.currentSmtpPort = 587;
            this.transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              auth: {
                user: this.fromEmail,
                pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
              },
              connectionTimeout: 120000,
              greetingTimeout: 60000,
              socketTimeout: 120000,
              tls: {
                rejectUnauthorized: false,
              },
              pool: false,
              maxConnections: 1,
              maxMessages: 1,
            });
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          // No more retries or different error
          break;
        }
      }
    }
    
    // All retries failed
    this.logger.error(`Failed to send email via Gmail SMTP after all retries:`, lastError);
    throw new Error(`Failed to send email: ${lastError?.message || 'Unknown error'}`);
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

