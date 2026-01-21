import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../../../dto';

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
