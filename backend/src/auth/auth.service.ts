import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { EmailQueueService } from '../email-queue/email-queue.service';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OtpType, SendOtpDto } from './dto/send-otp.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailQueue: EmailQueueService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(signupDto.password, 10);
      
      await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          fullName: signupDto.fullName,
          password: hashedPassword,
        },
      });

      await this.sendOtp({
        email: signupDto.email,
        type: OtpType.SIGNUP,
      });

      return {
        message: 'Registration pending. A new verification code has been sent to your email.',
        userId: existingUser.id,
      };
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: signupDto.email,
        fullName: signupDto.fullName,
        password: hashedPassword,
      },
    });

    await this.sendOtp({
      email: signupDto.email,
      type: OtpType.SIGNUP,
    });

    return {
      message: 'User created successfully. Please verify your email with the OTP sent.',
      userId: user.id,
    };
  }

  async sendOtp(sendOtpDto: SendOtpDto) {
    const otpCode = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otp.updateMany({
      where: {
        email: sendOtpDto.email,
        type: sendOtpDto.type,
        used: false,
      },
      data: {
        used: true,
      },
    });

    await this.prisma.otp.create({
      data: {
        email: sendOtpDto.email,
        code: otpCode,
        type: sendOtpDto.type,
        expiresAt,
      },
    });

    if (sendOtpDto.type === OtpType.RESET_PASSWORD) {
      await this.emailQueue.addPasswordResetEmail(sendOtpDto.email, { otpCode });
    } else {
      await this.emailQueue.addOtpEmail(sendOtpDto.email, { otpCode });
    }

    return {
      message: 'OTP sent successfully to your email',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const otp = await this.prisma.otp.findFirst({
      where: {
        email: verifyOtpDto.email,
        code: verifyOtpDto.code,
        type: verifyOtpDto.type,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (verifyOtpDto.type === OtpType.SIGNUP) {
      const user = await this.prisma.user.findUnique({
        where: { email: verifyOtpDto.email },
      });

      if (user) {
        await this.prisma.$transaction([
          this.prisma.otp.update({
            where: { id: otp.id },
            data: { used: true },
          }),
          this.prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true },
          }),
        ]);

        await this.emailQueue.addWelcomeEmail(user.email, { name: user.fullName || 'User' });
      }
    } else {
      await this.prisma.otp.update({
        where: { id: otp.id },
        data: { used: true },
      });
    }

    return {
      message: 'OTP verified successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been deleted');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      await this.sendOtp({
        email: user.email,
        type: OtpType.LOGIN,
      });
      throw new BadRequestException('Email not verified. OTP sent to your email.');
    }

    const tokens = await this.generateTokenPair(user.id, user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { jti: payload.jti },
        include: { user: true },
      });

      if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      await this.revokeRefreshToken(tokenRecord.jti);

      const tokens = await this.generateTokenPair(tokenRecord.userId, tokenRecord.user.email);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, jti: string) {
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      message: 'Logged out successfully',
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    };
  }

  private async generateTokenPair(userId: string, email: string) {
    const jti = randomBytes(16).toString('hex');

    const accessTokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };

    const refreshTokenPayload = {
      sub: userId,
      email,
      jti,
      type: 'refresh',
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const accessTokenExpiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshTokenExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    if (!jwtSecret || !jwtRefreshSecret) {
      throw new Error('JWT secrets are required in environment variables');
    }

    // @ts-expect-error - NestJS JWT types expect StringValue but ConfigService returns string
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: jwtSecret,
      expiresIn: accessTokenExpiresIn,
    });

    // @ts-expect-error - NestJS JWT types expect StringValue but ConfigService returns string
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: jwtRefreshSecret,
      expiresIn: refreshTokenExpiresIn,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        jti,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private async revokeRefreshToken(jti: string) {
    await this.prisma.refreshToken.updateMany({
      where: { jti },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return {
        message: 'If an account exists with this email, an OTP has been sent.',
      };
    }

    if (user.deletedAt) {
      throw new BadRequestException('Account has been deleted');
    }

    await this.sendOtp({
      email: forgotPasswordDto.email,
      type: OtpType.RESET_PASSWORD,
    });

    return {
      message: 'If an account exists with this email, an OTP has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const otp = await this.prisma.otp.findFirst({
      where: {
        email: resetPasswordDto.email,
        code: resetPasswordDto.code,
        type: OtpType.RESET_PASSWORD,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: resetPasswordDto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.deletedAt) {
      throw new BadRequestException('Account has been deleted');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.otp.update({
        where: { id: otp.id },
        data: { used: true },
      }),
    ]);

    return {
      message: 'Password reset successfully. You can now login with your new password.',
    };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

