import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from '../prisma';
import { SupabaseAuthGuard, SupabaseService } from '../supabase';
import type { AuthenticatedRequest } from '../supabase';
import { AuthDto, OnboardingDto } from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  async signUp(@Body() dto: AuthDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signUp({ email: dto.email, password: dto.password });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      accessToken: data.session?.access_token,
      user: data.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(@Body() dto: AuthDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.signInWithPassword({ email: dto.email, password: dto.password });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      accessToken: data.session?.access_token,
      user: data.user,
    };
  }

  @Post('onboarding')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete profile setup after signup' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  async onboarding(
    @Req() req: AuthenticatedRequest,
    @Body() dto: OnboardingDto,
  ) {
    if (req.user) {
      throw new BadRequestException('Profile already exists');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const user = await this.prisma.user.create({
      data: {
        id: req.supabaseUser.id,
        username: dto.username,
        bio: dto.bio,
      },
    });

    return user;
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  me(@Req() req: AuthenticatedRequest) {
    return {
      supabaseUser: req.supabaseUser,
      user: req.user,
    };
  }
}
