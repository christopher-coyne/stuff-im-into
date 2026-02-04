import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationMetaDto } from '../../../dto';
import { ReviewListItemDto } from './review-list-item.dto';

export class PaginatedReviewsDto {
  @Expose()
  @Type(() => ReviewListItemDto)
  @ApiProperty({ type: [ReviewListItemDto] })
  items: ReviewListItemDto[];

  @Expose()
  @Type(() => PaginationMetaDto)
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(data?: { items: ReviewListItemDto[]; meta: PaginationMetaDto }) {
    if (data) {
      this.items = data.items;
      this.meta = data.meta;
    }
  }
}
