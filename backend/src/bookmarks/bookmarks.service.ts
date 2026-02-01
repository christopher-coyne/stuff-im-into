import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { PaginationDto } from '../dto';
import { PrismaService } from '../prisma';
import {
  PaginatedBookmarkedReviewsDto,
  PaginatedBookmarkedUsersDto,
} from './dtos';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async getReviewBookmarks(
    user: User | null,
    query: PaginationDto,
  ): Promise<PaginatedBookmarkedReviewsDto> {
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where = {
      ownerId: user.id,
      review: {
        publishedAt: { not: null },
      },
    };

    const [bookmarks, total] = await Promise.all([
      this.prisma.reviewBookmark.findMany({
        where,
        include: {
          review: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.reviewBookmark.count({ where }),
    ]);

    return {
      items: bookmarks.map((b) => ({
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
        },
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserBookmarks(
    user: User | null,
    query: PaginationDto,
  ): Promise<PaginatedBookmarkedUsersDto> {
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where = { ownerId: user.id };

    const [bookmarks, total] = await Promise.all([
      this.prisma.userBookmark.findMany({
        where,
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
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.userBookmark.count({ where }),
    ]);

    return {
      items: bookmarks.map((b) => ({
        id: b.bookmarkedUser.id,
        username: b.bookmarkedUser.username,
        bio: b.bookmarkedUser.bio,
        avatarUrl: b.bookmarkedUser.avatarUrl,
        reviewCount: b.bookmarkedUser._count.reviews,
        bookmarkedAt: b.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async bookmarkUser(user: User | null, userId: string): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    // Can't bookmark yourself
    if (user.id === userId) {
      throw new ForbiddenException('Cannot bookmark yourself');
    }

    // Verify the user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Create bookmark (upsert to handle duplicates gracefully)
    await this.prisma.userBookmark.upsert({
      where: {
        ownerId_bookmarkedUserId: {
          ownerId: user.id,
          bookmarkedUserId: userId,
        },
      },
      create: {
        ownerId: user.id,
        bookmarkedUserId: userId,
      },
      update: {},
    });
  }

  async unbookmarkUser(user: User | null, userId: string): Promise<void> {
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    await this.prisma.userBookmark.deleteMany({
      where: {
        ownerId: user.id,
        bookmarkedUserId: userId,
      },
    });
  }

  async isUserBookmarked(user: User | null, userId: string): Promise<boolean> {
    if (!user) {
      return false;
    }

    const bookmark = await this.prisma.userBookmark.findUnique({
      where: {
        ownerId_bookmarkedUserId: {
          ownerId: user.id,
          bookmarkedUserId: userId,
        },
      },
    });

    return !!bookmark;
  }
}
