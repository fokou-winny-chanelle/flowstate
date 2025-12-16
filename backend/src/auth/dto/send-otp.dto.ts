import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsEnum } from 'class-validator';

export enum OtpType {
  SIGNUP = 'signup',
  LOGIN = 'login',
  RESET_PASSWORD = 'reset_password',
}

export class SendOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ enum: OtpType, example: OtpType.SIGNUP })
  @IsEnum(OtpType)
  @IsNotEmpty()
  type: OtpType;
}

