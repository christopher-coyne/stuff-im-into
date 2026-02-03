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
}
