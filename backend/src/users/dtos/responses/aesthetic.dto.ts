import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AestheticDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description: string | null;
}
