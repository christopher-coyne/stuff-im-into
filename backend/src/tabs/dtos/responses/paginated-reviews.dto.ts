import { PaginatedResponseDto } from '../../../dto';
import { ReviewListItemDto } from './review-list-item.dto';

export class PaginatedReviewsDto extends PaginatedResponseDto(
  ReviewListItemDto,
) {}
