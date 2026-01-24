import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CategoryDto, CreateTabDto, GetReviewsQueryDto, PaginatedReviewsDto, ReorderTabsDto, TabResponseDto } from './dtos';

@Injectable()
export class TabsService {
  constructor(private readonly prisma: PrismaService) {}

  async createTab(user: User, dto: CreateTabDto): Promise<TabResponseDto> {
    // Generate slug from name
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists for this user
    const existing = await this.prisma.tab.findUnique({
      where: { userId_slug: { userId: user.id, slug } },
    });

    if (existing) {
      throw new ConflictException('A tab with this name already exists');
    }

    // Get the highest sortOrder for this user's tabs
    const lastTab = await this.prisma.tab.findFirst({
      where: { userId: user.id },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const sortOrder = (lastTab?.sortOrder ?? -1) + 1;

    const tab = await this.prisma.tab.create({
      data: {
        userId: user.id,
        name: dto.name,
        slug,
        sortOrder,
      },
    });

    return {
      id: tab.id,
      name: tab.name,
      slug: tab.slug,
      sortOrder: tab.sortOrder,
    };
  }

  async reorderTabs(user: User, dto: ReorderTabsDto): Promise<TabResponseDto[]> {
    // Verify all tabs belong to the user
    const userTabs = await this.prisma.tab.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const userTabIds = new Set(userTabs.map((t) => t.id));
    for (const tabId of dto.tabIds) {
      if (!userTabIds.has(tabId)) {
        throw new NotFoundException(`Tab ${tabId} not found`);
      }
    }

    // Update sort orders in a transaction
    const updatedTabs = await this.prisma.$transaction(
      dto.tabIds.map((tabId, index) =>
        this.prisma.tab.update({
          where: { id: tabId },
          data: { sortOrder: index },
        }),
      ),
    );

    return updatedTabs.map((tab) => ({
      id: tab.id,
      name: tab.name,
      slug: tab.slug,
      sortOrder: tab.sortOrder,
    }));
  }

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
      select: { id: true, name: true, slug: true },
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
                select: { id: true, name: true, slug: true },
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
        categories: (
          review.categories as Array<{
            category: { id: string; name: string; slug: string };
          }>
        ).map(({ category }) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
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
