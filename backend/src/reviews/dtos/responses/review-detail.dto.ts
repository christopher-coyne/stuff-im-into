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

  constructor(data?: {
    id: string;
    username: string;
    avatarUrl: string | null;
  }) {
    if (data) {
      this.id = data.id;
      this.username = data.username;
      this.avatarUrl = data.avatarUrl;
    }
  }
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

  constructor(data?: { id: string; name: string; slug: string }) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.slug = data.slug;
    }
  }
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

  constructor(data?: { id: string; name: string; slug: string }) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.slug = data.slug;
    }
  }
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

  constructor(data?: { id: string; title: string; mediaUrl: string | null }) {
    if (data) {
      this.id = data.id;
      this.title = data.title;
      this.mediaUrl = data.mediaUrl;
    }
  }
}

export class MetaFieldDto {
  @Expose()
  @ApiProperty()
  label: string;

  @Expose()
  @ApiProperty()
  value: string;

  constructor(data?: { label: string; value: string }) {
    if (data) {
      this.label = data.label;
      this.value = data.value;
    }
  }
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
    this.id = review.id;
    this.title = review.title;
    this.description = review.description;
    this.author = review.author;
    this.mediaType = review.mediaType;
    this.mediaUrl = review.mediaUrl;
    this.mediaConfig = review.mediaConfig as object | null;
    this.link = review.link;
    this.metaFields =
      (review.metaFields as MetaFieldDto[] | null)?.map(
        (field) => new MetaFieldDto({ label: field.label, value: field.value }),
      ) ?? null;
    this.publishedAt = review.publishedAt!;
    this.user = new ReviewUserDto({
      id: review.user.id,
      username: review.user.username,
      avatarUrl: review.user.avatarUrl,
    });
    this.tab = new ReviewTabDto({
      id: review.tab.id,
      name: review.tab.name,
      slug: review.tab.slug,
    });
    this.categories = review.categories.map(
      ({ category }) =>
        new ReviewCategoryDto({
          id: category.id,
          name: category.name,
          slug: category.slug,
        }),
    );
    this.relatedReviews = review.relatedReviews
      .filter(({ target }) => target.publishedAt !== null)
      .map(
        ({ target }) =>
          new RelatedReviewDto({
            id: target.id,
            title: target.title,
            mediaUrl: target.mediaUrl,
          }),
      );
    this.isBookmarked = isBookmarked;
  }
}
