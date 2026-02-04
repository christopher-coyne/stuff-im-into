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

  constructor(data?: {
    id: string;
    title: string;
    description: string | null;
    mediaType: MediaType;
    mediaUrl: string | null;
    bookmarkedAt: Date;
    user: BookmarkedReviewUserDto;
  }) {
    if (data) {
      this.id = data.id;
      this.title = data.title;
      this.description = data.description;
      this.mediaType = data.mediaType;
      this.mediaUrl = data.mediaUrl;
      this.bookmarkedAt = data.bookmarkedAt;
      this.user = data.user;
    }
  }
}
