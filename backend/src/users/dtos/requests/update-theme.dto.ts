import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateThemeDto {
  @ApiProperty({
    description:
      'Slug of the aesthetic (e.g., "minimalist", "neobrutalist", "terminal")',
  })
  @IsString()
  aestheticSlug: string;

  @ApiProperty({
    description: 'Palette name (e.g., "default", "warm", "electric")',
  })
  @IsString()
  palette: string;
}
