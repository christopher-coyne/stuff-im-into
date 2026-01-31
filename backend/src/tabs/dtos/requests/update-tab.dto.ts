import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateTabDto {
  @ApiProperty({ description: 'New name for the tab', example: 'Movies' })
  @IsString()
  @MinLength(1)
  name: string;
}
