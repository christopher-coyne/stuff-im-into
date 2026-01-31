import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiStandardResponse, StandardResponse } from '../dto';
import { SupabaseAuthGuard, SupabaseService } from '../supabase';
import type { AuthenticatedRequest } from '../supabase';
import { AuthDto, AuthResponseDto, MeResponseDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiStandardResponse(AuthResponseDto, 201)
  async signUp(
    @Body() dto: AuthDto,
  ): Promise<StandardResponse<AuthResponseDto>> {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signUp({ email: dto.email, password: dto.password });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return StandardResponse.created({
      accessToken: data.session?.access_token,
      user: data.user ?? undefined,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiStandardResponse(AuthResponseDto)
  async login(
    @Body() dto: AuthDto,
  ): Promise<StandardResponse<AuthResponseDto>> {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email: dto.email, password: dto.password });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return StandardResponse.ok({
      accessToken: data.session?.access_token,
      user: data.user ?? undefined,
    });
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiStandardResponse(MeResponseDto)
  me(@Req() req: AuthenticatedRequest): StandardResponse<MeResponseDto> {
    return StandardResponse.ok({
      supabaseUser: req.supabaseUser,
      user: req.user,
    });
  }
}
