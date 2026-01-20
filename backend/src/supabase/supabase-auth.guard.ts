import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { PrismaService } from '../prisma';
import { SupabaseService } from './supabase.service';

export interface AuthenticatedRequest extends Request {
  user: User;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const token = authHeader.substring(7);

    try {
      const supabaseUser = await this.supabaseService.verifyToken(token);

      if (!supabaseUser?.email) {
        throw new UnauthorizedException('Invalid user');
      }

      const user = await this.prisma.user.upsert({
        where: { id: supabaseUser.id },
        update: { email: supabaseUser.email },
        create: {
          id: supabaseUser.id,
          email: supabaseUser.email,
        },
      });

      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
