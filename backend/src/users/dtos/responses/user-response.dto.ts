import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Theme, UserRole } from '@prisma/client';
import { TabDto } from './tab.dto';

export class UserResponseDto {
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

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  reviewCount: number;

  @ApiProperty()
  bookmarkCount: number;

  @ApiProperty({ type: [TabDto] })
  tabs: TabDto[];

  @ApiProperty({ description: 'Whether the current user has bookmarked this user' })
  isBookmarked: boolean;
}

export class UserDetailResponseDto extends UserResponseDto {
  @ApiProperty()
  updatedAt: Date;
}
