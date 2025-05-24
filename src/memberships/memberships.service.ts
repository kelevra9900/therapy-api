import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class MembershipsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.membership.findMany({
      orderBy: { priceMonthly: 'asc' },
    });
  }
}
