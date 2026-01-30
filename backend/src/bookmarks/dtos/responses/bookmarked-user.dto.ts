import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookmarkedUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  bio: string | null;

  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  bookmarkedAt: Date;
}
