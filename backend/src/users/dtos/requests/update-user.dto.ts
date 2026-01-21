import { ApiPropertyOptional } from '@nestjs/swagger';
import { Theme } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional()
  username?: string;

  @ApiPropertyOptional()
  bio?: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ enum: Theme })
  theme?: Theme;
}
