import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { StripeService } from '@/stripe/stripe.service';
import {SharedModule} from '@/common/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, StripeService],
})
export class SubscriptionsModule {}
