import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TabResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description?: string | null;

  @ApiProperty()
  sortOrder: number;
}
