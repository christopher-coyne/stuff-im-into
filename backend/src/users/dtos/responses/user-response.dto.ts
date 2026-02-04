import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { TabDto } from './tab.dto';
import { UserThemeDto } from './user-theme.dto';

/** Raw user data shape from Prisma with counts and relations */
export interface UserWithRelations {
  id: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  isPrivate: boolean;
  createdAt: Date;
  _count: { reviews: number; bookmarkedBy: number };
  tabs: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
  }[];
  userTheme: {
    id: string;
    aestheticId: string;
    palette: string;
    aesthetic: {
      id: string;
      slug: string;
      name: string;
      description: string | null;
    };
  } | null;
  bookmarkedBy?: { id: string }[];
}

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

  constructor(data?: UserWithRelations, currentUserId?: string) {
    if (data) {
      this.id = data.id;
      this.username = data.username;
      this.bio = data.bio;
      this.avatarUrl = data.avatarUrl;
      this.isPrivate = data.isPrivate;
      this.createdAt = data.createdAt;
      this.reviewCount = data._count.reviews;
      this.bookmarkCount = data._count.bookmarkedBy;
      this.tabs = data.tabs.map((tab) => new TabDto(tab));
      this.userTheme = data.userTheme ? new UserThemeDto(data.userTheme) : null;
      this.isBookmarked = currentUserId
        ? (data.bookmarkedBy?.length ?? 0) > 0
        : false;
    }
  }
}

/**
 * Extended user DTO that includes sensitive fields like role.
 * Only use this for endpoints where the user is viewing their own data (e.g., /me).
 */
export class UserSensitiveDataDto extends UserResponseDto {
  @Expose()
  @ApiProperty({ enum: UserRole })
  role: UserRole;

  constructor(
    data?: UserWithRelations & { role: UserRole },
    currentUserId?: string,
  ) {
    super(data, currentUserId);
    if (data) {
      this.role = data.role;
    }
  }
}
