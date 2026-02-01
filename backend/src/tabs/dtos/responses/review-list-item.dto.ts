import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { CategoryDto } from './category.dto';

export class ReviewListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

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

  @ApiProperty()
  publishedAt: Date;

  @ApiProperty({ type: [CategoryDto] })
  categories: CategoryDto[];

  @ApiProperty({
    description: 'Whether the current user has bookmarked this review',
  })
  isBookmarked: boolean;
}
