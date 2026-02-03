import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse } from '../dto/api-response.decorator';
import { StandardResponse } from '../dto/standard-response.dto';
import { SupabaseAuthGuard } from '../supabase';
import { DirectUploadResponseDto } from './uploads.dto';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('direct-upload-url')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a direct upload URL for Cloudflare Images',
    description:
      'Returns a one-time upload URL. POST the image file directly to this URL.',
  })
  @ApiStandardResponse(DirectUploadResponseDto)
  async getDirectUploadUrl(): Promise<
    StandardResponse<DirectUploadResponseDto>
  > {
    const { uploadUrl, imageId } =
      await this.uploadsService.getDirectUploadUrl();
    return StandardResponse.created({ uploadUrl, imageId });
  }
}
