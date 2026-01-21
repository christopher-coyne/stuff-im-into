import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CategoryDto, GetReviewsQueryDto, PaginatedReviewsDto } from './dtos';

@Injectable()
export class TabsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCategoriesForTab(tabId: string): Promise<CategoryDto[]> {
    // Verify tab exists
    const tab = await this.prisma.tab.findUnique({
      where: { id: tabId },
      select: { id: true },
    });

    if (!tab) {
      throw new NotFoundException(`Tab not found`);
    }

    // Get categories that have at least one published review in this tab
    const categories = await this.prisma.category.findMany({
      where: {
        reviews: {
          some: {
            review: {
              tabId,
              publishedAt: { not: null },
            },
          },
        },
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  async findReviewsForTab(
    tabId: string,
    query: GetReviewsQueryDto,
  ): Promise<PaginatedReviewsDto> {
    const { search, categoryId, page = 1, limit = 10 } = query;

    // Verify tab exists
    const tab = await this.prisma.tab.findUnique({
      where: { id: tabId },
      select: { id: true },
    });

    if (!tab) {
      throw new NotFoundException(`Tab not found`);
    }

    // Build where clause
    const where: Prisma.ReviewWhereInput = {
      tabId,
      publishedAt: { not: null },
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
      ...(categoryId && {
        categories: {
          some: { categoryId },
        },
      }),
    };

    // Get total count and reviews in parallel
    const [total, reviews] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        include: {
          categories: {
            include: {
              category: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
        skip: query.skip,
        take: query.take,
      }),
    ]);

    return {
      items: reviews.map((review) => ({
        id: review.id,
        title: review.title,
        mediaType: review.mediaType,
        mediaUrl: review.mediaUrl,
        mediaConfig: review.mediaConfig as object | null,
        publishedAt: review.publishedAt!,
        categories: review.categories.map((rc) => ({
          id: rc.category.id,
          name: rc.category.name,
        })),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
