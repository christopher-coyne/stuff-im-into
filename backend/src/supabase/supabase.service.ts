import { Injectable } from '@nestjs/common';
import { createClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: ReturnType<typeof createClient>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  getClient(): ReturnType<typeof createClient> {
    return this.supabase;
  }

  async verifyToken(token: string): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error) {
      throw error;
    }

    return user;
  }
}
