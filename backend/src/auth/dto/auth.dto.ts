import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: '帳號',
    example: 'user001',
  })
  @IsString()
  @IsNotEmpty()
  account!: string;

  @ApiProperty({
    description: '密碼',
    example: '000000',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    description: 'Email',
    example: 'user@example.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: '電話',
    example: '0912345678',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'LINE User ID',
    example: 'U4af49806ea6bd.....',
    required: false,
  })
  @IsString()
  @IsOptional()
  lineUserId?: string;
}

export class LoginDto {
  @ApiProperty({
    description: '帳號',
    example: 'user001',
  })
  @IsString()
  @IsNotEmpty()
  account!: string;

  @ApiProperty({
    description: '密碼',
    example: '000000',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: '用戶資訊',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'uuid-string' },
      account: { type: 'string', example: 'user001' },
      role: { type: 'string', example: 'USER' },
    },
  })
  user!: {
    id: string;
    account: string;
    role: string;
  };
}
