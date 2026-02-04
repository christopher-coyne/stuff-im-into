import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AestheticDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiPropertyOptional()
  description: string | null;

  constructor(data?: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
  }) {
    if (data) {
      this.id = data.id;
      this.slug = data.slug;
      this.name = data.name;
      this.description = data.description;
    }
  }
}
