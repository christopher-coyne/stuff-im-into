import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTabDto {
  @ApiProperty({ description: 'Name of the tab', example: 'Movies' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Short description of the tab (max 200 characters)',
    example: 'My favorite films and documentaries',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
