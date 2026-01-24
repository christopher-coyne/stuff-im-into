import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class ReorderTabsDto {
  @ApiProperty({
    description: 'Array of tab IDs in the desired order',
    example: ['tab-id-1', 'tab-id-2', 'tab-id-3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  tabIds: string[];
}
