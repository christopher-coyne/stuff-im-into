import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BookmarkedUserDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  username: string;

  @Expose()
  @ApiPropertyOptional()
  bio: string | null;

  @Expose()
  @ApiPropertyOptional()
  avatarUrl: string | null;

  @Expose()
  @ApiProperty()
  reviewCount: number;

  @Expose()
  @ApiProperty()
  bookmarkedAt: Date;

  constructor(data?: {
    id: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
    reviewCount: number;
    bookmarkedAt: Date;
  }) {
    if (data) {
      this.id = data.id;
      this.username = data.username;
      this.bio = data.bio;
      this.avatarUrl = data.avatarUrl;
      this.reviewCount = data.reviewCount;
      this.bookmarkedAt = data.bookmarkedAt;
    }
  }
}
