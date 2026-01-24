import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma';
import {
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UserResponseDto,
  UserSortBy,
} from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetUsersQueryDto, currentUserId?: string): Promise<UserResponseDto[]> {
    const { search, sortBy = UserSortBy.MOST_POPULAR } = query;
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
          select: { id: true, name: true, slug: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        bookmarkedBy: currentUserId
          ? {
              where: { ownerId: currentUserId },
              select: { id: true },
            }
          : false,
      },
      orderBy,
      skip: query.skip,
      take: query.take,
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
      tabs: user.tabs,
      isBookmarked: currentUserId
        ? (user.bookmarkedBy as { id: string }[])?.length > 0
        : false,
    }));
  }

  async findByUsername(username: string, currentUserId?: string): Promise<UserResponseDto> {
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
          select: { id: true, name: true, slug: true, sortOrder: true },
          orderBy: { sortOrder: 'asc' },
        },
        bookmarkedBy: currentUserId
          ? {
              where: { ownerId: currentUserId },
              select: { id: true },
            }
          : false,
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
      tabs: user.tabs,
      isBookmarked: currentUserId
        ? (user.bookmarkedBy as { id: string }[])?.length > 0
        : false,
    };
  }

  async getCurrentUser(user: User | null): Promise<UserResponseDto> {
    if (!user) {
      throw new ForbiddenException(
        'Profile not set up - complete onboarding first',
      );
    }
    return this.findById(user.id);
  }

  async updateCurrentUser(
    user: User | null,
    dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (!user) {
      throw new ForbiddenException(
        'Profile not set up - use PUT to create profile first',
      );
    }
    return this.update(user.id, dto);
  }

  async upsertCurrentUser(
    supabaseUserId: string,
    dto: CreateUserDto,
  ): Promise<UserResponseDto> {
    // Check if username is taken by another user
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUsername && existingUsername.id !== supabaseUserId) {
      throw new ConflictException('Username already taken');
    }

    const user = await this.prisma.user.upsert({
      where: { id: supabaseUserId },
      create: {
        id: supabaseUserId,
        username: dto.username,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        theme: dto.theme,
      },
      update: {
        username: dto.username,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        theme: dto.theme,
      },
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
          select: { id: true, name: true, slug: true, sortOrder: true },
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
      tabs: user.tabs,
      isBookmarked: false,
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
          select: { id: true, name: true, slug: true, sortOrder: true },
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
      tabs: user.tabs,
      isBookmarked: false,
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
          select: { id: true, name: true, slug: true, sortOrder: true },
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
      tabs: user.tabs,
      isBookmarked: false,
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
