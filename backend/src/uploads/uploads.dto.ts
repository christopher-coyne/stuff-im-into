import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DirectUploadResponseDto {
  @Expose()
  @ApiProperty({
    description: 'One-time upload URL to POST the image to',
    example: 'https://upload.imagedelivery.net/...',
  })
  uploadUrl: string;

  @Expose()
  @ApiProperty({
    description: 'The image ID that will be used in the final URL',
    example: 'abc123-def456',
  })
  imageId: string;
}

export class UploadResultDto {
  @Expose()
  @ApiProperty({
    description: 'The public URL of the uploaded image',
    example: 'https://imagedelivery.net/account_hash/image_id/public',
  })
  url: string;
}
