import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse, StandardResponse } from '../dto';
import { ReviewDetailDto } from './dtos';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a single review by ID' })
  @ApiStandardResponse(ReviewDetailDto)
  async findById(
    @Param('id') id: string,
  ): Promise<StandardResponse<ReviewDetailDto>> {
    const review = await this.reviewsService.findById(id);
    return StandardResponse.ok(review);
  }
}
