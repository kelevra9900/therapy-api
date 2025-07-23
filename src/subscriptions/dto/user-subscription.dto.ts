import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus, PaymentMethod } from 'generated/prisma';

export class UserSubscriptionDto {
  @ApiProperty() id: string;
  @ApiProperty() startDate: Date;
  @ApiProperty({ nullable: true }) endDate: Date | null;
  @ApiProperty({ nullable: true }) nextBillingDate: Date | null;
  @ApiProperty({ enum: SubscriptionStatus }) status: SubscriptionStatus;
  @ApiProperty({ enum: PaymentMethod }) paymentMethod: PaymentMethod;
  @ApiProperty() externalPaymentId: string;

  @ApiProperty({
    example: {
      id: 'membership-id',
      name: 'Plan Básico',
      priceMonthly: 9.99,
      features: ['Feature 1', 'Feature 2'],
    },
  })
  membership: any;
}
