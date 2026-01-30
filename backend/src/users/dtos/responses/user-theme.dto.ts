import { ApiProperty } from '@nestjs/swagger';
import { AestheticDto } from './aesthetic.dto';

export class UserThemeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  aestheticId: string;

  @ApiProperty({ description: 'Palette name (validated by frontend)' })
  palette: string;

  @ApiProperty({ type: AestheticDto })
  aesthetic: AestheticDto;
}
