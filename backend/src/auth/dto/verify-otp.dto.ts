import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsEnum, Length } from 'class-validator';
import { OtpType } from './send-otp.dto';

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  @IsNotEmpty()
  code: string;

  @ApiProperty({ enum: OtpType, example: OtpType.SIGNUP })
  @IsEnum(OtpType)
  @IsNotEmpty()
  type: OtpType;
}

