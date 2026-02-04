import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AestheticDto } from './aesthetic.dto';

export class UserThemeDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  aestheticId: string;

  @Expose()
  @ApiProperty({ description: 'Palette name (validated by frontend)' })
  palette: string;

  @Expose()
  @Type(() => AestheticDto)
  @ApiProperty({ type: AestheticDto })
  aesthetic: AestheticDto;

  constructor(data?: {
    id: string;
    aestheticId: string;
    palette: string;
    aesthetic: {
      id: string;
      slug: string;
      name: string;
      description: string | null;
    };
  }) {
    if (data) {
      this.id = data.id;
      this.aestheticId = data.aestheticId;
      this.palette = data.palette;
      this.aesthetic = new AestheticDto(data.aesthetic);
    }
  }
}
