import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type as TransformType } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';
import { Type } from '@nestjs/common';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @TransformType(() => Number)
  @IsPositive()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 35,
    required: false,
  })
  @IsOptional()
  @TransformType(() => Number)
  @IsPositive()
  @Min(1)
  @Max(35)
  limit?: number = 10;

  get skip(): number {
    return ((this.page ?? 1) - 1) * (this.limit ?? 10);
  }

  get take(): number {
    return this.limit ?? 10;
  }
}

export class PaginationMetaDto {
  @Expose()
  @ApiProperty({ description: 'Current page number' })
  page: number;

  @Expose()
  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @Expose()
  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @Expose()
  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}

/**
 * Mixin that creates a paginated response DTO class for the given item type.
 * Usage: `export class PaginatedUsersDto extends PaginatedResponseDto(UserDto) {}`
 */
export function PaginatedResponseDto<T>(ItemClass: Type<T>) {
  class PaginatedResponseClass {
    @Expose()
    @TransformType(() => ItemClass)
    @ApiProperty({ type: [ItemClass] })
    items: T[];

    @Expose()
    @TransformType(() => PaginationMetaDto)
    @ApiProperty({ type: PaginationMetaDto })
    meta: PaginationMetaDto;
  }
  return PaginatedResponseClass;
}
