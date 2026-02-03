import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { TabDto } from './tab.dto';
import { UserThemeDto } from './user-theme.dto';

export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiPropertyOptional()
  bio: string | null;

  @Expose()
  @ApiPropertyOptional()
  avatarUrl: string | null;

  @Expose()
  @ApiProperty({
    description: 'Whether the profile is private (hidden from explore/search)',
  })
  isPrivate: boolean;

  @Expose()
  @Type(() => UserThemeDto)
  @ApiPropertyOptional({
    type: UserThemeDto,
    description: 'User theme settings (null if not set)',
  })
  userTheme: UserThemeDto | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  reviewCount: number;

  @Expose()
  @ApiProperty()
  bookmarkCount: number;

  @Expose()
  @Type(() => TabDto)
  @ApiProperty({ type: [TabDto] })
  tabs: TabDto[];

  @Expose()
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
  @Expose()
  @ApiProperty({ enum: UserRole })
  role: UserRole;
}
