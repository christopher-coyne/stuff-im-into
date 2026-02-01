import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Name of the category', example: 'Favorites' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
