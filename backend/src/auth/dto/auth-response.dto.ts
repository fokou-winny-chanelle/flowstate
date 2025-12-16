import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      fullName: 'John Doe',
    },
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    fullName: string | null;
  };
}

export class OtpResponseDto {
  @ApiProperty({
    example: 'OTP sent successfully',
    description: 'Success message',
  })
  message: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email where OTP was sent',
  })
  email: string;
}

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Logged out successfully',
    description: 'Success message',
  })
  message: string;
}

