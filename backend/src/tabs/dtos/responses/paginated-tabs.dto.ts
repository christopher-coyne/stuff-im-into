import { PaginatedResponseDto } from '../../../dto';
import { TabResponseDto } from './tab-response.dto';

export class PaginatedTabsDto extends PaginatedResponseDto(TabResponseDto) {}
