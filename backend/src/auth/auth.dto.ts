import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Theme, UserRole } from '@prisma/client';

export class AuthDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'password123' })
  password: string;
}

export class OnboardingDto {
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiPropertyOptional({ example: 'Film enthusiast and bookworm' })
  bio?: string;
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

  @ApiProperty({ enum: Theme })
  theme: Theme;

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
