import { PaginatedResponseDto } from '../../../dto';
import { BookmarkedReviewDto } from './bookmarked-review.dto';
import { BookmarkedUserDto } from './bookmarked-user.dto';

export class PaginatedBookmarkedReviewsDto extends PaginatedResponseDto(
  BookmarkedReviewDto,
) {}

export class PaginatedBookmarkedUsersDto extends PaginatedResponseDto(
  BookmarkedUserDto,
) {}
