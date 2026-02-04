import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationMetaDto } from '../../../dto';
import { BookmarkedReviewDto } from './bookmarked-review.dto';
import { BookmarkedUserDto } from './bookmarked-user.dto';

export class PaginatedBookmarkedReviewsDto {
  @Expose()
  @Type(() => BookmarkedReviewDto)
  @ApiProperty({ type: [BookmarkedReviewDto] })
  items: BookmarkedReviewDto[];

  @Expose()
  @Type(() => PaginationMetaDto)
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(data?: {
    items: BookmarkedReviewDto[];
    meta: PaginationMetaDto;
  }) {
    if (data) {
      this.items = data.items;
      this.meta = data.meta;
    }
  }
}

export class PaginatedBookmarkedUsersDto {
  @Expose()
  @Type(() => BookmarkedUserDto)
  @ApiProperty({ type: [BookmarkedUserDto] })
  items: BookmarkedUserDto[];

  @Expose()
  @Type(() => PaginationMetaDto)
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(data?: { items: BookmarkedUserDto[]; meta: PaginationMetaDto }) {
    if (data) {
      this.items = data.items;
      this.meta = data.meta;
    }
  }
}
