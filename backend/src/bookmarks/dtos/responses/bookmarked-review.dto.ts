import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class BookmarkedReviewUserDto {
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

export class BookmarkedReviewDto {
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
  @ApiProperty({ enum: MediaType })
  mediaType: MediaType;

  @Expose()
  @ApiPropertyOptional()
  mediaUrl: string | null;

  @Expose()
  @ApiProperty()
  bookmarkedAt: Date;

  @Expose()
  @Type(() => BookmarkedReviewUserDto)
  @ApiProperty({ type: BookmarkedReviewUserDto })
  user: BookmarkedReviewUserDto;
}
