import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  async sendOtpEmail(to: string, otpCode: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to,
      subject: 'FlowState - Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #14A800;">FlowState Verification</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #14A800; margin: 0; font-size: 32px; letter-spacing: 5px;">${otpCode}</h1>
          </div>
          <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}`, error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to,
      subject: 'Welcome to FlowState!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #14A800;">Welcome to FlowState, ${name}!</h2>
          <p>Your account has been successfully created. Start organizing your tasks and achieving your goals.</p>
          <p style="color: #666;">The calm place for your busy mind.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${to}`, error);
    }
  }
}

