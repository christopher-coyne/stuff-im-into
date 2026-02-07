import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { CategoryDto } from './category.dto';

export class ReviewListItemDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  title: string;

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
  @ApiProperty()
  publishedAt: Date;

  @Expose()
  @Type(() => CategoryDto)
  @ApiProperty({ type: [CategoryDto] })
  categories: CategoryDto[];

  @Expose()
  @ApiProperty({
    description: 'Whether the current user has bookmarked this review',
  })
  isBookmarked: boolean;

  @Expose()
  @ApiProperty({
    description: 'Whether this review has a description',
  })
  hasDescription: boolean;

  constructor(data?: {
    id: string;
    title: string;
    author: string | null;
    mediaType: MediaType;
    mediaUrl: string | null;
    mediaConfig: object | null;
    link: string | null;
    publishedAt: Date;
    categories: CategoryDto[];
    isBookmarked: boolean;
    hasDescription: boolean;
  }) {
    if (data) {
      this.id = data.id;
      this.title = data.title;
      this.author = data.author;
      this.mediaType = data.mediaType;
      this.mediaUrl = data.mediaUrl;
      this.mediaConfig = data.mediaConfig;
      this.link = data.link;
      this.publishedAt = data.publishedAt;
      this.categories = data.categories;
      this.isBookmarked = data.isBookmarked;
      this.hasDescription = data.hasDescription;
    }
  }
}
