import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateTabDto {
  @ApiProperty({ description: 'Name of the tab', example: 'Movies' })
  @IsString()
  @MinLength(1)
  name: string;
}
