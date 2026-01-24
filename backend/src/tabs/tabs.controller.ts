import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiStandardArrayResponse,
  ApiStandardResponse,
  StandardResponse,
} from '../dto';
import { SupabaseAuthGuard, type AuthenticatedRequest } from '../supabase';
import { CategoryDto, CreateCategoryDto, CreateTabDto, GetReviewsQueryDto, PaginatedReviewsDto, ReorderTabsDto, TabResponseDto } from './dtos';
import { TabsService } from './tabs.service';

@ApiTags('Tabs')
@Controller('tabs')
export class TabsController {
  constructor(private readonly tabsService: TabsService) {}

  @Post()
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tab' })
  @ApiStandardResponse(TabResponseDto, 201)
  async createTab(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTabDto,
  ): Promise<StandardResponse<TabResponseDto>> {
    if (!req.user) {
      throw new Error('User profile not found');
    }
    const tab = await this.tabsService.createTab(req.user, dto);
    return StandardResponse.created(tab);
  }

  @Patch('reorder')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder tabs' })
  @ApiStandardArrayResponse(TabResponseDto)
  async reorderTabs(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ReorderTabsDto,
  ): Promise<StandardResponse<TabResponseDto[]>> {
    if (!req.user) {
      throw new Error('User profile not found');
    }
    const tabs = await this.tabsService.reorderTabs(req.user, dto);
    return StandardResponse.ok(tabs);
  }

  @Get(':tabId/categories')
  @ApiOperation({ summary: 'Get categories for a specific tab' })
  @ApiStandardArrayResponse(CategoryDto)
  async findCategoriesForTab(
    @Param('tabId') tabId: string,
  ): Promise<StandardResponse<CategoryDto[]>> {
    const categories = await this.tabsService.findCategoriesForTab(tabId);
    return StandardResponse.ok(categories);
  }

  @Post(':tabId/categories')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category for a tab' })
  @ApiStandardResponse(CategoryDto, 201)
  async createCategory(
    @Req() req: AuthenticatedRequest,
    @Param('tabId') tabId: string,
    @Body() dto: CreateCategoryDto,
  ): Promise<StandardResponse<CategoryDto>> {
    if (!req.user) {
      throw new Error('User profile not found');
    }
    const category = await this.tabsService.createCategory(req.user, tabId, dto);
    return StandardResponse.created(category);
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
