import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TabDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;

  @Expose()
  @ApiPropertyOptional({ type: String, nullable: true })
  description?: string | null;

  @Expose()
  @ApiProperty()
  sortOrder: number;

  constructor(data?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
  }) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.slug = data.slug;
      this.description = data.description;
      this.sortOrder = data.sortOrder;
    }
  }
}
