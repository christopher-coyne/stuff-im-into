import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationMetaDto } from '../../../dto';
import { CategoryDto } from './category.dto';

export class PaginatedCategoriesDto {
  @Expose()
  @Type(() => CategoryDto)
  @ApiProperty({ type: [CategoryDto] })
  items: CategoryDto[];

  @Expose()
  @Type(() => PaginationMetaDto)
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(data?: { items: CategoryDto[]; meta: PaginationMetaDto }) {
    if (data) {
      this.items = data.items;
      this.meta = data.meta;
    }
  }
}
