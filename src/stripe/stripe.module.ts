import { Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import {SharedModule} from '@/common/shared.module';
import {SubscriptionsService} from '@/subscriptions/subscriptions.service';

@Module({
  imports: [SharedModule],
  controllers: [StripeController],
  providers: [StripeService, SubscriptionsService],
})
export class StripeModule {}
