import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  GetUsersQueryDto,
  UpdateUserDto,
  UserResponseDto,
  UserSortBy,
} from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetUsersQueryDto): Promise<UserResponseDto[]> {
    const { search, sortBy = UserSortBy.MOST_POPULAR, limit = 20, offset = 0 } = query;

    const orderBy = this.getOrderBy(sortBy);

    const users = await this.prisma.user.findMany({
      where: search
        ? {
            username: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : undefined,
      include: {
        _count: {
          select: {
            reviews: {
              where: { publishedAt: { not: null } },
            },
            bookmarkedBy: true,
          },
        },
        tabs: {
          select: { name: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy,
      take: Number(limit),
      skip: Number(offset),
    });

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
      role: user.role,
      createdAt: user.createdAt,
      reviewCount: user._count.reviews,
      bookmarkCount: user._count.bookmarkedBy,
      tabNames: user.tabs.map((tab) => tab.name),
    }));
  }

  async findByUsername(username: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            reviews: {
              where: { publishedAt: { not: null } },
            },
            bookmarkedBy: true,
          },
        },
        tabs: {
          select: { name: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User @${username} not found`);
    }

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
      role: user.role,
      createdAt: user.createdAt,
      reviewCount: user._count.reviews,
      bookmarkCount: user._count.bookmarkedBy,
      tabNames: user.tabs.map((tab) => tab.name),
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            reviews: {
              where: { publishedAt: { not: null } },
            },
            bookmarkedBy: true,
          },
        },
        tabs: {
          select: { name: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
      role: user.role,
      createdAt: user.createdAt,
      reviewCount: user._count.reviews,
      bookmarkCount: user._count.bookmarkedBy,
      tabNames: user.tabs.map((tab) => tab.name),
    };
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: {
        _count: {
          select: {
            reviews: {
              where: { publishedAt: { not: null } },
            },
            bookmarkedBy: true,
          },
        },
        tabs: {
          select: { name: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
      role: user.role,
      createdAt: user.createdAt,
      reviewCount: user._count.reviews,
      bookmarkCount: user._count.bookmarkedBy,
      tabNames: user.tabs.map((tab) => tab.name),
    };
  }

  private getOrderBy(sortBy: UserSortBy) {
    switch (sortBy) {
      case UserSortBy.MOST_POPULAR:
        return { bookmarkedBy: { _count: 'desc' as const } };
      case UserSortBy.RECENTLY_ACTIVE:
        return { updatedAt: 'desc' as const };
      case UserSortBy.NEWEST:
        return { createdAt: 'desc' as const };
      case UserSortBy.MOST_REVIEWS:
        return { reviews: { _count: 'desc' as const } };
      default:
        return { createdAt: 'desc' as const };
    }
  }
}
