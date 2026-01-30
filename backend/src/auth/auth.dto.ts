import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class AuthResponseDto {
  @ApiPropertyOptional()
  accessToken?: string;

  @ApiPropertyOptional()
  user?: object;
}

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  bio?: string | null;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class MeResponseDto {
  @ApiProperty()
  supabaseUser: object;

  @ApiPropertyOptional({ type: UserProfileDto })
  user: UserProfileDto | null;
}
