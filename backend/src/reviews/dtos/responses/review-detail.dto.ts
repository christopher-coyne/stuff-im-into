import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category, MediaType, Review, Tab, User } from '@prisma/client';

export class ReviewUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  avatarUrl: string | null;
}

export class ReviewTabDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

export class ReviewCategoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;
}

export class RelatedReviewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  mediaUrl: string | null;
}

export class MetaFieldDto {
  @ApiProperty()
  label: string;

  @ApiProperty()
  value: string;
}

export class ReviewDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  author: string | null;

  @ApiProperty({ enum: MediaType })
  mediaType: MediaType;

  @ApiPropertyOptional()
  mediaUrl: string | null;

  @ApiPropertyOptional({ type: Object })
  mediaConfig: object | null;

  @ApiPropertyOptional({ description: 'Optional external link' })
  link: string | null;

  @ApiPropertyOptional({ type: [MetaFieldDto] })
  metaFields: MetaFieldDto[] | null;

  @ApiProperty()
  publishedAt: Date;

  @ApiProperty({ type: ReviewUserDto })
  user: ReviewUserDto;

  @ApiProperty({ type: ReviewTabDto })
  tab: ReviewTabDto;

  @ApiProperty({ type: [ReviewCategoryDto] })
  categories: ReviewCategoryDto[];

  @ApiProperty({ type: [RelatedReviewDto] })
  relatedReviews: RelatedReviewDto[];

  @ApiProperty({
    description: 'Whether the current user has bookmarked this review',
  })
  isBookmarked: boolean;

  constructor(
    review: Review & {
      user: User;
      tab: Tab;
      categories: { category: Category }[];
      relatedReviews: { target: Review }[];
    },
    isBookmarked: boolean = false,
  ) {
    Object.assign(this, {
      id: review.id,
      title: review.title,
      description: review.description,
      author: review.author,
      mediaType: review.mediaType,
      mediaUrl: review.mediaUrl,
      mediaConfig: review.mediaConfig,
      link: review.link,
      metaFields: review.metaFields,
      publishedAt: review.publishedAt,
      user: {
        id: review.user.id,
        username: review.user.username,
        avatarUrl: review.user.avatarUrl,
      },
      tab: {
        id: review.tab.id,
        name: review.tab.name,
        slug: review.tab.slug,
      },
      categories: review.categories.map(({ category }) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
      })),
      relatedReviews: review.relatedReviews
        .filter(({ target }) => target.publishedAt !== null)
        .map(({ target }) => ({
          id: target.id,
          title: target.title,
          mediaUrl: target.mediaUrl,
        })),
      isBookmarked,
    });
  }
}
