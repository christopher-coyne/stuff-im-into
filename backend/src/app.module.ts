import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { BookmarksModule } from './bookmarks';
import { PrismaModule } from './prisma';
import { ReviewsModule } from './reviews';
import { SupabaseModule } from './supabase';
import { TabsModule } from './tabs';
import { UsersModule } from './users';

@Module({
  imports: [
    PrismaModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
    TabsModule,
    ReviewsModule,
    BookmarksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
