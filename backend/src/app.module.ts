import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma';
import { SupabaseModule } from './supabase';

@Module({
  imports: [PrismaModule, SupabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
