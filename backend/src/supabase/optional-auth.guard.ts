import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { SupabaseService } from './supabase.service';
import type { AuthenticatedRequest } from './supabase-auth.guard';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    // No auth header - allow request but don't set user
    if (!authHeader?.startsWith('Bearer ')) {
      request.user = null;
      return true;
    }

    const token = authHeader.substring(7);

    try {
      const supabaseUser = await this.supabaseService.verifyToken(token);

      if (supabaseUser) {
        request.supabaseUser = supabaseUser;
        request.user = await this.prisma.user.findUnique({
          where: { id: supabaseUser.id },
        });
      } else {
        request.user = null;
      }
    } catch {
      // Invalid token - allow request but don't set user
      request.user = null;
    }

    return true;
  }
}
