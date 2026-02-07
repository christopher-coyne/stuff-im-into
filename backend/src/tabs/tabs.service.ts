import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { PaginationMetaDto } from '../dto';
import { PrismaService } from '../prisma';
import {
  CategoryDto,
  CreateCategoryDto,
  CreateTabDto,
  GetReviewsQueryDto,
  PaginatedCategoriesDto,
  PaginatedReviewsDto,
  PaginatedTabsDto,
  ReorderTabsDto,
  ReviewListItemDto,
  TabResponseDto,
  UpdateTabDto,
} from './dtos';

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
        description: dto.description,
        sortOrder,
      },
    });

    return new TabResponseDto({
      id: tab.id,
      name: tab.name,
      slug: tab.slug,
      description: tab.description,
      sortOrder: tab.sortOrder,
    });
  }

  async reorderTabs(
    user: User,
    dto: ReorderTabsDto,
  ): Promise<PaginatedTabsDto> {
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

    const items = updatedTabs.map(
      (tab) =>
        new TabResponseDto({
          id: tab.id,
          name: tab.name,
          slug: tab.slug,
          description: tab.description,
          sortOrder: tab.sortOrder,
        }),
    );

    return new PaginatedTabsDto({
      items,
      meta: new PaginationMetaDto({
        page: 1,
        limit: items.length,
        total: items.length,
        totalPages: 1,
      }),
    });
  }

  async findCategoriesForTab(tabId: string): Promise<PaginatedCategoriesDto> {
    // Verify tab exists
    const tab = await this.prisma.tab.findUnique({
      where: { id: tabId },
      select: { id: true },
    });

    if (!tab) {
      throw new NotFoundException(`Tab not found`);
    }

    // Get all categories for this tab
    const categories = await this.prisma.category.findMany({
      where: { tabId },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });

    const items = categories.map(
      (category) =>
        new CategoryDto({
          id: category.id,
          name: category.name,
          slug: category.slug,
        }),
    );

    return new PaginatedCategoriesDto({
      items,
      meta: new PaginationMetaDto({
        page: 1,
        limit: categories.length,
        total: categories.length,
        totalPages: 1,
      }),
    });
  }

  async createCategory(
    user: User,
    tabId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryDto> {
    // Verify tab exists and belongs to the user
    const tab = await this.prisma.tab.findUnique({
      where: { id: tabId },
      select: { id: true, userId: true },
    });

    if (!tab) {
      throw new NotFoundException(`Tab not found`);
    }

    if (tab.userId !== user.id) {
      throw new ForbiddenException(
        `You do not have permission to add categories to this tab`,
      );
    }

    // Generate slug from name
    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if category with this slug already exists in this tab
    const existing = await this.prisma.category.findUnique({
      where: { tabId_slug: { tabId, slug } },
    });

    if (existing) {
      throw new ConflictException(
        'A category with this name already exists in this tab',
      );
    }

    const category = await this.prisma.category.create({
      data: {
        tabId,
        name: dto.name,
        slug,
      },
    });

    return new CategoryDto({
      id: category.id,
      name: category.name,
      slug: category.slug,
    });
  }

  async findReviewsForTab(
    tabId: string,
    query: GetReviewsQueryDto,
    userId?: string,
  ): Promise<PaginatedReviewsDto> {
    const { search, categoryId, hasDescription, page = 1, limit = 10 } = query;

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
      ...(hasDescription && {
        description: { not: null },
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
          bookmarkedBy: userId
            ? {
                where: { ownerId: userId },
                select: { id: true },
              }
            : false,
        },
        orderBy: { sortOrder: 'asc' },
        skip: query.skip,
        take: query.take,
      }),
    ]);

    const items = reviews.map(
      (review) =>
        new ReviewListItemDto({
          id: review.id,
          title: review.title,
          author: review.author,
          mediaType: review.mediaType,
          mediaUrl: review.mediaUrl,
          mediaConfig: review.mediaConfig as object | null,
          link: review.link,
          publishedAt: review.publishedAt!,
          categories: (
            review.categories as Array<{
              category: { id: string; name: string; slug: string };
            }>
          ).map(
            ({ category }) =>
              new CategoryDto({
                id: category.id,
                name: category.name,
                slug: category.slug,
              }),
          ),
          isBookmarked: userId
            ? (review.bookmarkedBy as Array<{ id: string }>)?.length > 0
            : false,
          hasDescription: !!review.description,
        }),
    );

    return new PaginatedReviewsDto({
      items,
      meta: new PaginationMetaDto({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }),
    });
  }

  async updateTab(
    user: User,
    tabId: string,
    dto: UpdateTabDto,
  ): Promise<TabResponseDto> {
    // Verify tab exists and belongs to the user
    const tab = await this.prisma.tab.findUnique({
      where: { id: tabId },
      select: { id: true, userId: true, name: true, slug: true },
    });

    if (!tab) {
      throw new NotFoundException('Tab not found');
    }

    if (tab.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to update this tab',
      );
    }

    // Build update data
    const updateData: {
      name?: string;
      slug?: string;
      description?: string | null;
    } = {};

    // If name is being updated, regenerate slug and check for conflicts
    if (dto.name !== undefined) {
      const slug = dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if slug already exists for this user (excluding current tab)
      const existing = await this.prisma.tab.findFirst({
        where: {
          userId: user.id,
          slug,
          id: { not: tabId },
        },
      });

      if (existing) {
        throw new ConflictException('A tab with this name already exists');
      }

      updateData.name = dto.name;
      updateData.slug = slug;
    }

    // Handle description update (can be set to null to clear it)
    if (dto.description !== undefined) {
      updateData.description = dto.description || null;
    }

    const updatedTab = await this.prisma.tab.update({
      where: { id: tabId },
      data: updateData,
    });

    return new TabResponseDto({
      id: updatedTab.id,
      name: updatedTab.name,
      slug: updatedTab.slug,
      description: updatedTab.description,
      sortOrder: updatedTab.sortOrder,
    });
  }

  async deleteTab(user: User, tabId: string): Promise<void> {
    // Verify tab exists and belongs to the user
    const tab = await this.prisma.tab.findUnique({
      where: { id: tabId },
      select: { id: true, userId: true },
    });

    if (!tab) {
      throw new NotFoundException('Tab not found');
    }

    if (tab.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this tab',
      );
    }

    // Delete the tab (cascades will handle reviews, categories, etc.)
    await this.prisma.tab.delete({
      where: { id: tabId },
    });
  }
}
