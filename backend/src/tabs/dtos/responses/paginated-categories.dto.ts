import { PaginatedResponseDto } from '../../../dto';
import { CategoryDto } from './category.dto';

export class PaginatedCategoriesDto extends PaginatedResponseDto(CategoryDto) {}
