import { ApiProperty } from '@nestjs/swagger';

export class DirectUploadResponseDto {
  @ApiProperty({
    description: 'One-time upload URL to POST the image to',
    example: 'https://upload.imagedelivery.net/...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'The image ID that will be used in the final URL',
    example: 'abc123-def456',
  })
  imageId: string;
}

export class UploadResultDto {
  @ApiProperty({
    description: 'The public URL of the uploaded image',
    example: 'https://imagedelivery.net/account_hash/image_id/public',
  })
  url: string;
}
