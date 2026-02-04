import { PaginatedResponseDto, PaginationMetaDto } from '../../../dto';
import { CategoryDto } from './category.dto';

export class PaginatedCategoriesDto extends PaginatedResponseDto(CategoryDto) {
  constructor(data?: { items: CategoryDto[]; meta: PaginationMetaDto }) {
    super();
    if (data) {
      this.items = data.items;
      this.meta = data.meta;
    }
  }
}
