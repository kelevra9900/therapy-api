import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async logPayment({
    subscriptionId,
    amount,
    method,
    status,
    paidAt,
  }: {
    subscriptionId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    paidAt: Date;
  }) {
    return this.prisma.paymentLog.create({
      data: {
        subscriptionId,
        amount,
        method,
        status,
        paidAt,
      },
    });
  }

  async getUserPayments(userId: string) {
    return this.prisma.paymentLog.findMany({
      where: {
        subscription: {
          userId,
        },
      },
      orderBy: {
        paidAt: 'desc',
      },
    });
  }

}
