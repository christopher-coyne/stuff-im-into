import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class BookmarkedReviewUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  avatarUrl: string | null;
}

export class BookmarkedReviewDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiProperty({ enum: MediaType })
  mediaType: MediaType;

  @ApiPropertyOptional()
  mediaUrl: string | null;

  @ApiProperty()
  bookmarkedAt: Date;

  @ApiProperty({ type: BookmarkedReviewUserDto })
  user: BookmarkedReviewUserDto;
}
