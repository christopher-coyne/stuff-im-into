import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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

  @Post('reviews/:reviewId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bookmark a review' })
  async bookmarkReview(
    @Req() req: AuthenticatedRequest,
    @Param('reviewId') reviewId: string,
  ): Promise<StandardResponse<null>> {
    await this.bookmarksService.bookmarkReview(req.user, reviewId);
    return StandardResponse.created(null);
  }

  @Delete('reviews/:reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a review bookmark' })
  async unbookmarkReview(
    @Req() req: AuthenticatedRequest,
    @Param('reviewId') reviewId: string,
  ): Promise<StandardResponse<null>> {
    await this.bookmarksService.unbookmarkReview(req.user, reviewId);
    return StandardResponse.ok(null);
  }

  @Post('users/:userId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Bookmark a user' })
  async bookmarkUser(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ): Promise<StandardResponse<null>> {
    await this.bookmarksService.bookmarkUser(req.user, userId);
    return StandardResponse.created(null);
  }

  @Delete('users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a user bookmark' })
  async unbookmarkUser(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
  ): Promise<StandardResponse<null>> {
    await this.bookmarksService.unbookmarkUser(req.user, userId);
    return StandardResponse.ok(null);
  }
}
