import { PaginatedResponseDto, PaginationMetaDto } from '../../../dto';
import { ReviewListItemDto } from './review-list-item.dto';

export class PaginatedReviewsDto extends PaginatedResponseDto(
  ReviewListItemDto,
) {
  constructor(data?: { items: ReviewListItemDto[]; meta: PaginationMetaDto }) {
    super();
    if (data) {
      this.items = data.items;
      this.meta = data.meta;
    }
  }
}
