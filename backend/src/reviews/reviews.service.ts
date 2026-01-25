import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { MediaType, Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateReviewDto, ReviewDetailDto, UpdateReviewDto } from './dtos';

// Helper functions for extracting embed IDs from URLs

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractSpotifyEmbed(
  url: string,
): { type: 'track' | 'album' | 'playlist'; id: string } | null {
  const match = url.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
  if (match) {
    return { type: match[1] as 'track' | 'album' | 'playlist', id: match[2] };
  }
  return null;
}

async function fetchSpotifyThumbnail(url: string): Promise<string | null> {
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
    const response = await fetch(oembedUrl);
    if (!response.ok) return null;
    const data = await response.json();
    return data.thumbnail_url || null;
  } catch {
    return null;
  }
}

async function buildMediaConfig(
  mediaType: MediaType,
  mediaUrl: string | undefined,
  existingConfig?: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  if (!mediaUrl) return existingConfig || null;

  switch (mediaType) {
    case 'VIDEO': {
      const videoId = extractYouTubeId(mediaUrl);
      if (!videoId) {
        throw new BadRequestException(
          'Invalid YouTube URL. Please provide a valid YouTube link.',
        );
      }
      return { videoId, ...existingConfig };
    }
    case 'SPOTIFY': {
      const embed = extractSpotifyEmbed(mediaUrl);
      if (!embed) {
        throw new BadRequestException(
          'Invalid Spotify URL. Please provide a valid Spotify track, album, or playlist link.',
        );
      }
      // Fetch thumbnail from Spotify oEmbed API
      const thumbnailUrl = await fetchSpotifyThumbnail(mediaUrl);
      return {
        embedType: embed.type,
        embedId: embed.id,
        thumbnailUrl,
        ...existingConfig,
      };
    }
    case 'EXTERNAL_LINK': {
      try {
        const parsedUrl = new URL(mediaUrl);
        return { domain: parsedUrl.hostname, ...existingConfig };
      } catch {
        throw new BadRequestException(
          'Invalid URL. Please provide a valid external link.',
        );
      }
    }
    case 'TEXT':
      // For TEXT type, preserve the content from existingConfig
      return existingConfig || null;
    case 'IMAGE':
    default:
      return existingConfig || null;
  }
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, userId?: string): Promise<ReviewDetailDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: true,
        tab: true,
        categories: {
          include: { category: true },
        },
        relatedReviews: {
          include: { target: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!review || !review.publishedAt) {
      throw new NotFoundException('Review not found');
    }

    // Check if the user has bookmarked this review
    let isBookmarked = false;
    if (userId) {
      const bookmark = await this.prisma.reviewBookmark.findUnique({
        where: {
          ownerId_reviewId: {
            ownerId: userId,
            reviewId: id,
          },
        },
      });
      isBookmarked = !!bookmark;
    }

    return new ReviewDetailDto(review, isBookmarked);
  }

  async create(user: User, dto: CreateReviewDto): Promise<ReviewDetailDto> {
    // Verify tab exists and belongs to the user
    const tab = await this.prisma.tab.findUnique({
      where: { id: dto.tabId },
      select: { id: true, userId: true },
    });

    if (!tab) {
      throw new NotFoundException('Tab not found');
    }

    if (tab.userId !== user.id) {
      throw new ForbiddenException('You do not have permission to add reviews to this tab');
    }

    // Verify all category IDs belong to this tab
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const categories = await this.prisma.category.findMany({
        where: {
          id: { in: dto.categoryIds },
          tabId: dto.tabId,
        },
        select: { id: true },
      });

      if (categories.length !== dto.categoryIds.length) {
        throw new NotFoundException('One or more categories not found in this tab');
      }
    }

    // Get the highest sortOrder for this tab's reviews
    const lastReview = await this.prisma.review.findFirst({
      where: { tabId: dto.tabId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const sortOrder = (lastReview?.sortOrder ?? -1) + 1;

    // Build mediaConfig from URL if applicable
    const mediaConfig = await buildMediaConfig(
      dto.mediaType,
      dto.mediaUrl,
      dto.mediaConfig,
    );

    const review = await this.prisma.review.create({
      data: {
        userId: user.id,
        tabId: dto.tabId,
        title: dto.title,
        description: dto.description,
        author: dto.author,
        mediaType: dto.mediaType,
        mediaUrl: dto.mediaUrl,
        mediaConfig: mediaConfig as Prisma.InputJsonValue,
        metaFields: dto.metaFields as unknown as Prisma.InputJsonValue,
        sortOrder,
        publishedAt: dto.publish ? new Date() : null,
        categories: dto.categoryIds
          ? {
              create: dto.categoryIds.map((categoryId) => ({ categoryId })),
            }
          : undefined,
      },
      include: {
        user: true,
        tab: true,
        categories: {
          include: { category: true },
        },
        relatedReviews: {
          include: { target: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return new ReviewDetailDto(review, false);
  }

  async update(
    id: string,
    user: User,
    dto: UpdateReviewDto,
  ): Promise<ReviewDetailDto> {
    // Find the review and verify ownership
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: { id: true, userId: true, tabId: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to edit this review',
      );
    }

    // Verify all category IDs belong to the review's tab
    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const categories = await this.prisma.category.findMany({
        where: {
          id: { in: dto.categoryIds },
          tabId: review.tabId,
        },
        select: { id: true },
      });

      if (categories.length !== dto.categoryIds.length) {
        throw new NotFoundException(
          'One or more categories not found in this tab',
        );
      }
    }

    // Build update data
    const updateData: Prisma.ReviewUpdateInput = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.author !== undefined) updateData.author = dto.author;
    if (dto.mediaType !== undefined) updateData.mediaType = dto.mediaType;
    if (dto.mediaUrl !== undefined) updateData.mediaUrl = dto.mediaUrl;
    if (dto.metaFields !== undefined) {
      updateData.metaFields =
        dto.metaFields as unknown as Prisma.InputJsonValue;
    }
    if (dto.publish !== undefined) {
      updateData.publishedAt = dto.publish ? new Date() : null;
    }

    // Build mediaConfig if media fields are being updated
    if (dto.mediaType !== undefined || dto.mediaUrl !== undefined) {
      // Fetch current review to get existing mediaType if not provided
      const currentReview = await this.prisma.review.findUnique({
        where: { id },
        select: { mediaType: true },
      });
      const mediaType = dto.mediaType ?? currentReview?.mediaType;
      if (mediaType) {
        const mediaConfig = await buildMediaConfig(
          mediaType,
          dto.mediaUrl,
          dto.mediaConfig,
        );
        updateData.mediaConfig = mediaConfig as Prisma.InputJsonValue;
      }
    }

    // Handle category updates
    if (dto.categoryIds !== undefined) {
      // Delete existing category relations and create new ones
      await this.prisma.reviewCategory.deleteMany({
        where: { reviewId: id },
      });

      if (dto.categoryIds.length > 0) {
        await this.prisma.reviewCategory.createMany({
          data: dto.categoryIds.map((categoryId) => ({
            reviewId: id,
            categoryId,
          })),
        });
      }
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        tab: true,
        categories: {
          include: { category: true },
        },
        relatedReviews: {
          include: { target: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return new ReviewDetailDto(updatedReview, false);
  }

  async delete(id: string, user: User): Promise<void> {
    // Find the review and verify ownership
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this review',
      );
    }

    // Delete the review (cascades will handle related records)
    await this.prisma.review.delete({
      where: { id },
    });
  }
}
