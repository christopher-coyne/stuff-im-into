import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardArrayResponse, StandardResponse } from '../dto';
import { SupabaseAuthGuard } from '../supabase';
import type { AuthenticatedRequest } from '../supabase';
import { BookmarksService } from './bookmarks.service';
import { BookmarkedReviewDto, BookmarkedUserDto } from './dtos';

@ApiTags('Bookmarks')
@Controller('bookmarks')
@UseGuards(SupabaseAuthGuard)
@ApiBearerAuth()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get('reviews')
  @ApiOperation({ summary: 'Get bookmarked reviews for current user' })
  @ApiStandardArrayResponse(BookmarkedReviewDto)
  async getReviewBookmarks(
    @Req() req: AuthenticatedRequest,
  ): Promise<StandardResponse<BookmarkedReviewDto[]>> {
    const bookmarks = await this.bookmarksService.getReviewBookmarks(req.user);
    return StandardResponse.ok(bookmarks);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get bookmarked users for current user' })
  @ApiStandardArrayResponse(BookmarkedUserDto)
  async getUserBookmarks(
    @Req() req: AuthenticatedRequest,
  ): Promise<StandardResponse<BookmarkedUserDto[]>> {
    const bookmarks = await this.bookmarksService.getUserBookmarks(req.user);
    return StandardResponse.ok(bookmarks);
  }
}
