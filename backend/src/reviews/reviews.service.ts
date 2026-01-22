import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { ReviewDetailDto } from './dtos';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ReviewDetailDto> {
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

    return new ReviewDetailDto(review);
  }
}
