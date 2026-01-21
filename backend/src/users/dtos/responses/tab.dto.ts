import { ApiProperty } from '@nestjs/swagger';

export class TabDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  sortOrder: number;
}
