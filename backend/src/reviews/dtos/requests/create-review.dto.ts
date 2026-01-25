import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class MetaFieldInputDto {
  @ApiProperty({ description: 'Label for the meta field', example: 'Director' })
  @IsString()
  @MinLength(1)
  label: string;

  @ApiProperty({ description: 'Value for the meta field', example: 'Denis Villeneuve' })
  @IsString()
  value: string;
}

export class CreateReviewDto {
  @ApiProperty({ description: 'Title of the review', example: 'Blade Runner 2049' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ description: 'Tab ID this review belongs to' })
  @IsUUID()
  tabId: string;

  @ApiPropertyOptional({ description: 'Markdown description/content' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Author/creator of the media', example: 'Christopher Nolan' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ description: 'Type of media', enum: MediaType, example: 'VIDEO' })
  @IsEnum(MediaType)
  mediaType: MediaType;

  @ApiPropertyOptional({ description: 'URL of the media' })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiPropertyOptional({
    description: 'Type-specific media configuration (e.g., videoId for YouTube, embedId for Spotify)',
  })
  @IsOptional()
  @IsObject()
  mediaConfig?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Category IDs to assign to this review' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Meta fields (key-value pairs)', type: [MetaFieldInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MetaFieldInputDto)
  metaFields?: MetaFieldInputDto[];

  @ApiPropertyOptional({ description: 'Whether to publish immediately (default: false)' })
  @IsOptional()
  publish?: boolean;
}
