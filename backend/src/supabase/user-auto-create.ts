import type { User } from '@prisma/client';
import type { PrismaService } from '../prisma';
import { generateRandomUsername } from '../utils/generate-username';

const MAX_RETRIES = 5;

export async function findOrCreateUser(
  prisma: PrismaService,
  supabaseUserId: string,
): Promise<User> {
  const existing = await prisma.user.findUnique({
    where: { id: supabaseUserId },
  });

  if (existing) {
    return existing;
  }

  // Auto-create with a random username, retrying on collision
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await prisma.user.create({
        data: {
          id: supabaseUserId,
          username: generateRandomUsername(),
        },
      });
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      // P2002 = unique constraint violation (username collision)
      if (prismaError.code === 'P2002' && i < MAX_RETRIES - 1) {
        continue;
      }
      throw error;
    }
  }

  // Should never reach here, but satisfy TypeScript
  throw new Error('Failed to generate a unique username');
}
