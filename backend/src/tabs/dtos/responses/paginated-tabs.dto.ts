import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationMetaDto } from '../../../dto';
import { TabResponseDto } from './tab-response.dto';

export class PaginatedTabsDto {
  @Expose()
  @Type(() => TabResponseDto)
  @ApiProperty({ type: [TabResponseDto] })
  items: TabResponseDto[];

  @Expose()
  @Type(() => PaginationMetaDto)
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(data?: { items: TabResponseDto[]; meta: PaginationMetaDto }) {
    if (data) {
      this.items = data.items;
      this.meta = data.meta;
    }
  }
}
