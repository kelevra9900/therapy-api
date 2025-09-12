// src/auth/password-reset.module.ts
import { Module } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { SharedModule } from '@/common/shared.module'; // incluye Prisma
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SharedModule, ConfigModule],
  providers: [PasswordResetService],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
