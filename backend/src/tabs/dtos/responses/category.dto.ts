import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CategoryDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  slug: string;

  constructor(data?: { id: string; name: string; slug: string }) {
    if (data) {
      this.id = data.id;
      this.name = data.name;
      this.slug = data.slug;
    }
  }
}
