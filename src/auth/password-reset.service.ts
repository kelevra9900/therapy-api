// src/auth/password-reset.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PasswordResetService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }) {
    return this.prisma.passwordResetToken.create({
      data,
    });
  }

  async findByToken(token: string) {
    return this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async invalidateByToken(token: string) {
    return this.prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });
  }
}
