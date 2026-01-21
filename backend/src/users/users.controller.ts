import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SupabaseAuthGuard } from '../supabase';
import type { AuthenticatedRequest } from '../supabase';
import {
  GetUsersQueryDto,
  UpdateUserDto,
  UserResponseDto,
} from './users.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (for explore page)' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  findAll(@Query() query: GetUsersQueryDto): Promise<UserResponseDto[]> {
    return this.usersService.findAll(query);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  getMe(@Req() req: AuthenticatedRequest): Promise<UserResponseDto> {
    if (!req.user) {
      throw new Error('User not found - complete onboarding first');
    }
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    if (!req.user) {
      throw new Error('User not found - complete onboarding first');
    }
    return this.usersService.update(req.user.id, dto);
  }

  @Get(':username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  findByUsername(@Param('username') username: string): Promise<UserResponseDto> {
    return this.usersService.findByUsername(username);
  }
}
