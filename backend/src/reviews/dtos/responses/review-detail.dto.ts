import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category, MediaType, Review, Tab, User } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class ReviewUserDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiPropertyOptional()
  avatarUrl: string | null;
}

export class ReviewTabDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;
}

export class ReviewCategoryDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;
}

export class RelatedReviewDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiPropertyOptional()
  mediaUrl: string | null;
}

export class MetaFieldDto {
  @Expose()
  @ApiProperty()
  label: string;

  @Expose()
  @ApiProperty()
  value: string;
}

export class ReviewDetailDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  title: string;

  @Expose()
  @ApiPropertyOptional()
  description: string | null;

  @Expose()
  @ApiPropertyOptional()
  author: string | null;

  @Expose()
  @ApiProperty({ enum: MediaType })
  mediaType: MediaType;

  @Expose()
  @ApiPropertyOptional()
  mediaUrl: string | null;

  @Expose()
  @ApiPropertyOptional({ type: Object })
  mediaConfig: object | null;

  @Expose()
  @ApiPropertyOptional({ description: 'Optional external link' })
  link: string | null;

  @Expose()
  @Type(() => MetaFieldDto)
  @ApiPropertyOptional({ type: [MetaFieldDto] })
  metaFields: MetaFieldDto[] | null;

  @Expose()
  @ApiProperty()
  publishedAt: Date;

  @Expose()
  @Type(() => ReviewUserDto)
  @ApiProperty({ type: ReviewUserDto })
  user: ReviewUserDto;

  @Expose()
  @Type(() => ReviewTabDto)
  @ApiProperty({ type: ReviewTabDto })
  tab: ReviewTabDto;

  @Expose()
  @Type(() => ReviewCategoryDto)
  @ApiProperty({ type: [ReviewCategoryDto] })
  categories: ReviewCategoryDto[];

  @Expose()
  @Type(() => RelatedReviewDto)
  @ApiProperty({ type: [RelatedReviewDto] })
  relatedReviews: RelatedReviewDto[];

  @Expose()
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
