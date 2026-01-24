import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse, StandardResponse } from '../dto';
import { OptionalAuthGuard, SupabaseAuthGuard, type AuthenticatedRequest } from '../supabase';
import { CreateReviewDto, ReviewDetailDto, UpdateReviewDto } from './dtos';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  @ApiStandardResponse(ReviewDetailDto, 201)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReviewDto,
  ): Promise<StandardResponse<ReviewDetailDto>> {
    if (!req.user) {
      throw new Error('User profile not found');
    }
    const review = await this.reviewsService.create(req.user, dto);
    return StandardResponse.created(review);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single review by ID' })
  @ApiStandardResponse(ReviewDetailDto)
  async findById(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<StandardResponse<ReviewDetailDto>> {
    const review = await this.reviewsService.findById(id, req.user?.id);
    return StandardResponse.ok(review);
  }

  @Patch(':id')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  @ApiStandardResponse(ReviewDetailDto)
  async update(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateReviewDto,
  ): Promise<StandardResponse<ReviewDetailDto>> {
    if (!req.user) {
      throw new Error('User profile not found');
    }
    const review = await this.reviewsService.update(id, req.user, dto);
    return StandardResponse.ok(review);
  }
}
