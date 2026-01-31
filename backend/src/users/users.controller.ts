import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiStandardArrayResponse,
  ApiStandardResponse,
  StandardResponse,
} from '../dto';
import { OptionalAuthGuard, SupabaseAuthGuard } from '../supabase';
import type { AuthenticatedRequest } from '../supabase';
import { CreateUserDto, GetUsersQueryDto, UpdateThemeDto, UpdateUserDto, UserResponseDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (for explore page)' })
  @ApiStandardArrayResponse(UserResponseDto)
  async findAll(
    @Query() query: GetUsersQueryDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<StandardResponse<UserResponseDto[]>> {
    const users = await this.usersService.findAll(query, req.user?.id);
    return StandardResponse.ok(users);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiStandardResponse(UserResponseDto)
  async getMe(
    @Req() req: AuthenticatedRequest,
  ): Promise<StandardResponse<UserResponseDto>> {
    const user = await this.usersService.getCurrentUser(req.user);
    return StandardResponse.ok(user);
  }

  @Put('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or replace current user profile' })
  @ApiStandardResponse(UserResponseDto)
  async upsertMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateUserDto,
  ): Promise<StandardResponse<UserResponseDto>> {
    const user = await this.usersService.upsertCurrentUser(req.supabaseUser.id, dto);
    return StandardResponse.ok(user);
  }

  @Patch('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiStandardResponse(UserResponseDto)
  async updateMe(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserDto,
  ): Promise<StandardResponse<UserResponseDto>> {
    const user = await this.usersService.updateCurrentUser(req.user, dto);
    return StandardResponse.ok(user);
  }

  @Put('me/theme')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user theme' })
  @ApiStandardResponse(UserResponseDto)
  async updateTheme(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateThemeDto,
  ): Promise<StandardResponse<UserResponseDto>> {
    const user = await this.usersService.updateTheme(req.user, dto);
    return StandardResponse.ok(user);
  }

  @Get(':username')
  @UseGuards(OptionalAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by username' })
  @ApiStandardResponse(UserResponseDto)
  async findByUsername(
    @Param('username') username: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<StandardResponse<UserResponseDto>> {
    const user = await this.usersService.findByUsername(username, req.user?.id);
    return StandardResponse.ok(user);
  }
}
