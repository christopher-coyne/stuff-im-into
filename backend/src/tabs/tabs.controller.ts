import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiStandardArrayResponse,
  ApiStandardResponse,
  StandardResponse,
} from '../dto';
import { CategoryDto, GetReviewsQueryDto, PaginatedReviewsDto } from './dtos';
import { TabsService } from './tabs.service';

@ApiTags('Tabs')
@Controller('tabs')
export class TabsController {
  constructor(private readonly tabsService: TabsService) {}

  @Get(':tabId/categories')
  @ApiOperation({ summary: 'Get categories used in a specific tab' })
  @ApiStandardArrayResponse(CategoryDto)
  async findCategoriesForTab(
    @Param('tabId') tabId: string,
  ): Promise<StandardResponse<CategoryDto[]>> {
    const categories = await this.tabsService.findCategoriesForTab(tabId);
    return StandardResponse.ok(categories);
  }

  @Get(':tabId/reviews')
  @ApiOperation({ summary: 'Get paginated reviews for a specific tab' })
  @ApiStandardResponse(PaginatedReviewsDto)
  async findReviewsForTab(
    @Param('tabId') tabId: string,
    @Query() query: GetReviewsQueryDto,
  ): Promise<StandardResponse<PaginatedReviewsDto>> {
    const result = await this.tabsService.findReviewsForTab(tabId, query);
    return StandardResponse.ok(result);
  }
}
