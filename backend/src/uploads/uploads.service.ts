import { Injectable, InternalServerErrorException } from '@nestjs/common';

interface CloudflareDirectUploadResponse {
  result: {
    id: string;
    uploadURL: string;
  };
  success: boolean;
  errors: Array<{ code: number; message: string }>;
}

@Injectable()
export class UploadsService {
  private readonly accountId: string;
  private readonly apiToken: string;
  private readonly accountHash: string;

  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.apiToken = process.env.CLOUDFLARE_IMAGES_API_TOKEN || '';
    this.accountHash = process.env.CLOUDFLARE_ACCOUNT_HASH || '';

    if (!this.accountId || !this.apiToken || !this.accountHash) {
      console.warn(
        'Cloudflare Images credentials not configured. Image uploads will fail.',
      );
    }
  }

  /**
   * Request a direct upload URL from Cloudflare.
   * The client will upload directly to this URL.
   */
  async getDirectUploadUrl(): Promise<{ uploadUrl: string; imageId: string }> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v2/direct_upload`;

    // Cloudflare requires multipart/form-data for this endpoint
    const formData = new FormData();
    // Optional: set metadata or expiry
    // formData.append('expiry', new Date(Date.now() + 30 * 60 * 1000).toISOString());

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Cloudflare direct upload request failed:', text);
      throw new InternalServerErrorException(
        'Failed to get upload URL from Cloudflare',
      );
    }

    const data = (await response.json()) as CloudflareDirectUploadResponse;

    if (!data.success || !data.result) {
      console.error('Cloudflare API error:', data.errors);
      throw new InternalServerErrorException(
        'Failed to get upload URL from Cloudflare',
      );
    }

    return {
      uploadUrl: data.result.uploadURL,
      imageId: data.result.id,
    };
  }

  /**
   * Build the public URL for a Cloudflare image.
   * @param imageId The image ID from Cloudflare
   * @param variant The image variant (e.g., 'public', 'thumbnail')
   */
  getImageUrl(imageId: string, variant = 'public'): string {
    return `https://imagedelivery.net/${this.accountHash}/${imageId}/${variant}`;
  }
}
