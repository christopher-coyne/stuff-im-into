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
  PaginatedUsersDto,
  UpdateThemeDto,
  UpdateUserDto,
  UserResponseDto,
  UserSensitiveDataDto,
  UserSortBy,
} from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    query: GetUsersQueryDto,
    currentUserId?: string,
  ): Promise<PaginatedUsersDto> {
    const { search, sortBy = UserSortBy.MOST_POPULAR } = query;
    const orderBy = this.getOrderBy(sortBy);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where = {
      // Only show public profiles in explore/search
      isPrivate: false,
      ...(search
        ? {
            username: {
              contains: search,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
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
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              sortOrder: true,
            },
            orderBy: { sortOrder: 'asc' },
          },
          userTheme: {
            include: {
              aesthetic: true,
            },
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
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map((user) => ({
        id: user.id,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        isPrivate: user.isPrivate,
        userTheme: user.userTheme
          ? {
              id: user.userTheme.id,
              aestheticId: user.userTheme.aestheticId,
              palette: user.userTheme.palette,
              aesthetic: user.userTheme.aesthetic,
            }
          : null,
        createdAt: user.createdAt,
        reviewCount: user._count.reviews,
        bookmarkCount: user._count.bookmarkedBy,
        tabs: user.tabs,
        isBookmarked: currentUserId
          ? (user.bookmarkedBy as { id: string }[])?.length > 0
          : false,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByUsername(
    username: string,
    currentUserId?: string,
  ): Promise<UserResponseDto> {
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
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        userTheme: {
          include: {
            aesthetic: true,
          },
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
      isPrivate: user.isPrivate,
      userTheme: user.userTheme
        ? {
            id: user.userTheme.id,
            aestheticId: user.userTheme.aestheticId,
            palette: user.userTheme.palette,
            aesthetic: user.userTheme.aesthetic,
          }
        : null,
      createdAt: user.createdAt,
      reviewCount: user._count.reviews,
      bookmarkCount: user._count.bookmarkedBy,
      tabs: user.tabs,
      isBookmarked: currentUserId
        ? (user.bookmarkedBy as { id: string }[])?.length > 0
        : false,
    };
  }

  async getCurrentUser(user: User | null): Promise<UserSensitiveDataDto> {
    if (!user) {
      throw new ForbiddenException(
        'Profile not set up - complete onboarding first',
      );
    }
    const userData = await this.findById(user.id);
    return { ...userData, role: user.role };
  }

  async updateCurrentUser(
    user: User | null,
    dto: UpdateUserDto,
  ): Promise<UserSensitiveDataDto> {
    if (!user) {
      throw new ForbiddenException(
        'Profile not set up - use PUT to create profile first',
      );
    }
    const userData = await this.update(user.id, dto);
    return { ...userData, role: user.role };
  }

  async upsertCurrentUser(
    supabaseUserId: string,
    dto: CreateUserDto,
  ): Promise<UserSensitiveDataDto> {
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
      },
      update: {
        username: dto.username,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
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
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        userTheme: {
          include: {
            aesthetic: true,
          },
        },
      },
    });

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      userTheme: user.userTheme
        ? {
            id: user.userTheme.id,
            aestheticId: user.userTheme.aestheticId,
            palette: user.userTheme.palette,
            aesthetic: user.userTheme.aesthetic,
          }
        : null,
      createdAt: user.createdAt,
      reviewCount: user._count.reviews,
      bookmarkCount: user._count.bookmarkedBy,
      tabs: user.tabs,
      isBookmarked: false,
      role: user.role,
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
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        userTheme: {
          include: {
            aesthetic: true,
          },
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
      isPrivate: user.isPrivate,
      userTheme: user.userTheme
        ? {
            id: user.userTheme.id,
            aestheticId: user.userTheme.aestheticId,
            palette: user.userTheme.palette,
            aesthetic: user.userTheme.aesthetic,
          }
        : null,
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
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        userTheme: {
          include: {
            aesthetic: true,
          },
        },
      },
    });

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      isPrivate: user.isPrivate,
      userTheme: user.userTheme
        ? {
            id: user.userTheme.id,
            aestheticId: user.userTheme.aestheticId,
            palette: user.userTheme.palette,
            aesthetic: user.userTheme.aesthetic,
          }
        : null,
      createdAt: user.createdAt,
      reviewCount: user._count.reviews,
      bookmarkCount: user._count.bookmarkedBy,
      tabs: user.tabs,
      isBookmarked: false,
    };
  }

  async updateTheme(
    user: User | null,
    dto: UpdateThemeDto,
  ): Promise<UserSensitiveDataDto> {
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    // Find the aesthetic by slug
    const aesthetic = await this.prisma.aesthetic.findUnique({
      where: { slug: dto.aestheticSlug },
    });

    if (!aesthetic) {
      throw new NotFoundException(`Aesthetic "${dto.aestheticSlug}" not found`);
    }

    // Upsert the user theme
    await this.prisma.userTheme.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        aestheticId: aesthetic.id,
        palette: dto.palette,
      },
      update: {
        aestheticId: aesthetic.id,
        palette: dto.palette,
      },
    });

    // Return the updated user with sensitive data
    const userData = await this.findById(user.id);
    return { ...userData, role: user.role };
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
