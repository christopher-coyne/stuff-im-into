import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Theme, UserRole } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../dto';

export enum UserSortBy {
  MOST_POPULAR = 'most_popular',
  RECENTLY_ACTIVE = 'recently_active',
  NEWEST = 'newest',
  MOST_REVIEWS = 'most_reviews',
}

export class GetUsersQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by username' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: UserSortBy, default: UserSortBy.MOST_POPULAR })
  @IsOptional()
  @IsEnum(UserSortBy)
  sortBy?: UserSortBy;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  bio: string | null;

  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiProperty({ enum: Theme })
  theme: Theme;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  bookmarkCount: number;

  @ApiProperty({ type: [String] })
  tabNames: string[];
}

export class UserDetailResponseDto extends UserResponseDto {
  @ApiProperty()
  updatedAt: Date;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: Theme })
  theme?: Theme;
}
