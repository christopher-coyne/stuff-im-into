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
}
