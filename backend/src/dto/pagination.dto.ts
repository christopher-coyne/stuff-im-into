import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
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
  @Type(() => Number)
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

  constructor(data?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }) {
    if (data) {
      this.page = data.page;
      this.limit = data.limit;
      this.total = data.total;
      this.totalPages = data.totalPages;
    }
  }
}
