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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiStandardArrayResponse,
  ApiStandardResponse,
  StandardResponse,
} from '../dto';
import { SupabaseAuthGuard } from '../supabase';
import type { AuthenticatedRequest } from '../supabase';
import { GetUsersQueryDto, UpdateUserDto, UserResponseDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (for explore page)' })
  @ApiStandardArrayResponse(UserResponseDto)
  async findAll(
    @Query() query: GetUsersQueryDto,
  ): Promise<StandardResponse<UserResponseDto[]>> {
    const users = await this.usersService.findAll(query);
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

  @Get(':username')
  @ApiOperation({ summary: 'Get user by username' })
  @ApiStandardResponse(UserResponseDto)
  async findByUsername(
    @Param('username') username: string,
  ): Promise<StandardResponse<UserResponseDto>> {
    const user = await this.usersService.findByUsername(username);
    return StandardResponse.ok(user);
  }
}
