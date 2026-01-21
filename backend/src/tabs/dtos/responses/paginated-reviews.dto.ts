import { ApiProperty } from '@nestjs/swagger';
import { ReviewListItemDto } from './review-list-item.dto';

export class PaginationMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginatedReviewsDto {
  @ApiProperty({ type: [ReviewListItemDto] })
  items: ReviewListItemDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
