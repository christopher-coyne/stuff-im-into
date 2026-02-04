import { PaginatedResponseDto, PaginationMetaDto } from '../../../dto';
import { TabResponseDto } from './tab-response.dto';

export class PaginatedTabsDto extends PaginatedResponseDto(TabResponseDto) {
  constructor(data?: { items: TabResponseDto[]; meta: PaginationMetaDto }) {
    super();
    if (data) {
      this.items = data.items;
      this.meta = data.meta;
    }
  }
}
