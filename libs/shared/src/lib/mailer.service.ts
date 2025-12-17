import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import mjml2html from 'mjml';
import * as path from 'path';
import { Resend } from 'resend';

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

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private resend: Resend;
  private readonly fromEmail: string;
  
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY not found. Email service will not work.');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.configService.get<string>('RESEND_FROM_EMAIL') ||
      'onboarding@resend.dev';
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

      if (options.context) {
        templateContent = this.compileTemplate(templateContent, options.context);
      }

      const html = this.mjmlToHtml(templateContent);

      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      await this.resend.emails.send({
        from: this.fromEmail,
        to: recipients,
        subject: options.subject,
        html,
      });

      this.logger.log(
        `Email sent successfully to ${recipients.join(', ')}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email`, error);
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
    context: OtpEmailContext,
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
}

