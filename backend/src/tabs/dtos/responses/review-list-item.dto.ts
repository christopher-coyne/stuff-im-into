import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { CategoryDto } from './category.dto';

export class ReviewListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ enum: MediaType })
  mediaType: MediaType;

  @ApiPropertyOptional()
  mediaUrl: string | null;

  @ApiPropertyOptional({ type: Object })
  mediaConfig: object | null;

  @ApiProperty()
  publishedAt: Date;

  @ApiProperty({ type: [CategoryDto] })
  categories: CategoryDto[];
}
