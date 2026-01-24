import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Theme } from '@prisma/client';

export class BookmarkedUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiPropertyOptional()
  bio: string | null;

  @ApiPropertyOptional()
  avatarUrl: string | null;

  @ApiProperty({ enum: Theme })
  theme: Theme;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  bookmarkedAt: Date;
}
