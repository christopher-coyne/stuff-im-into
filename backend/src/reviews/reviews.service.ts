import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma';
import { CreateReviewDto, ReviewDetailDto, UpdateReviewDto } from './dtos';

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

    const review = await this.prisma.review.create({
      data: {
        userId: user.id,
        tabId: dto.tabId,
        title: dto.title,
        description: dto.description,
        mediaType: dto.mediaType,
        mediaUrl: dto.mediaUrl,
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
    if (dto.mediaType !== undefined) updateData.mediaType = dto.mediaType;
    if (dto.mediaUrl !== undefined) updateData.mediaUrl = dto.mediaUrl;
    if (dto.metaFields !== undefined)
      updateData.metaFields =
        dto.metaFields as unknown as Prisma.InputJsonValue;
    if (dto.publish !== undefined) {
      updateData.publishedAt = dto.publish ? new Date() : null;
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
}
