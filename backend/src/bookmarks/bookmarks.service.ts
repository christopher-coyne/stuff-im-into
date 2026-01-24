import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma';
import { BookmarkedReviewDto, BookmarkedUserDto } from './dtos';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async getReviewBookmarks(user: User | null): Promise<BookmarkedReviewDto[]> {
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    const bookmarks = await this.prisma.reviewBookmark.findMany({
      where: { ownerId: user.id },
      include: {
        review: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookmarks
      .filter((b) => b.review.publishedAt !== null)
      .map((b) => ({
        id: b.review.id,
        title: b.review.title,
        description: b.review.description,
        mediaType: b.review.mediaType,
        mediaUrl: b.review.mediaUrl,
        bookmarkedAt: b.createdAt,
        user: {
          id: b.review.user.id,
          username: b.review.user.username,
          avatarUrl: b.review.user.avatarUrl,
          theme: b.review.user.theme,
        },
      }));
  }

  async getUserBookmarks(user: User | null): Promise<BookmarkedUserDto[]> {
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    const bookmarks = await this.prisma.userBookmark.findMany({
      where: { ownerId: user.id },
      include: {
        bookmarkedUser: {
          include: {
            _count: {
              select: {
                reviews: {
                  where: { publishedAt: { not: null } },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookmarks.map((b) => ({
      id: b.bookmarkedUser.id,
      username: b.bookmarkedUser.username,
      bio: b.bookmarkedUser.bio,
      avatarUrl: b.bookmarkedUser.avatarUrl,
      theme: b.bookmarkedUser.theme,
      reviewCount: b.bookmarkedUser._count.reviews,
      bookmarkedAt: b.createdAt,
    }));
  }

  async bookmarkReview(user: User | null, reviewId: string): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    // Verify the review exists and is published
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true, publishedAt: true },
    });

    if (!review || !review.publishedAt) {
      throw new NotFoundException('Review not found');
    }

    // Create bookmark (upsert to handle duplicates gracefully)
    await this.prisma.reviewBookmark.upsert({
      where: {
        ownerId_reviewId: {
          ownerId: user.id,
          reviewId,
        },
      },
      create: {
        ownerId: user.id,
        reviewId,
      },
      update: {},
    });
  }

  async unbookmarkReview(user: User | null, reviewId: string): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    await this.prisma.reviewBookmark.deleteMany({
      where: {
        ownerId: user.id,
        reviewId,
      },
    });
  }

  async isReviewBookmarked(
    user: User | null,
    reviewId: string,
  ): Promise<boolean> {
    if (!user) {
      return false;
    }

    const bookmark = await this.prisma.reviewBookmark.findUnique({
      where: {
        ownerId_reviewId: {
          ownerId: user.id,
          reviewId,
        },
      },
    });

    return !!bookmark;
  }
}
