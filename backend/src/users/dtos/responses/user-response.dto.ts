import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { TabDto } from './tab.dto';
import { UserThemeDto } from './user-theme.dto';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  bio: string | null;

  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiProperty({ description: 'Whether the profile is private (hidden from explore/search)' })
  isPrivate: boolean;

  @ApiPropertyOptional({
    type: UserThemeDto,
    description: 'User theme settings (null if not set)',
  })
  userTheme: UserThemeDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  bookmarkCount: number;

  @ApiProperty({ type: [TabDto] })
  tabs: TabDto[];

  @ApiProperty({
    description: 'Whether the current user has bookmarked this user',
  })
  isBookmarked: boolean;
}

/**
 * Extended user DTO that includes sensitive fields like role.
 * Only use this for endpoints where the user is viewing their own data (e.g., /me).
 */
export class UserSensitiveDataDto extends UserResponseDto {
  @ApiProperty({ enum: UserRole })
  role: UserRole;
}
