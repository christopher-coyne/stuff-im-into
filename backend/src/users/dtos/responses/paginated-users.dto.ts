import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationMetaDto } from '../../../dto';
import { UserResponseDto } from './user-response.dto';

export class PaginatedUsersDto {
  @Expose()
  @Type(() => UserResponseDto)
  @ApiProperty({ type: [UserResponseDto] })
  items: UserResponseDto[];

  @Expose()
  @Type(() => PaginationMetaDto)
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;

  constructor(data?: { items: UserResponseDto[]; meta: PaginationMetaDto }) {
    if (data) {
      this.items = data.items;
      this.meta = data.meta;
    }
  }
}
