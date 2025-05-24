import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';

import { SubscriptionsService } from './subscriptions.service';
import { AuthGuard } from '@/auth/auth.guard';
import { User } from '@/common/decorators/user.decorator';
import { JwtPayload } from '@/auth/types';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import {Roles} from '@/common/roles.decorator';
import {Role} from '@prisma/index';
import {RolesGuard} from '@/common/guards/roles.guard';
import {CreateDirectSubscriptionDto} from './dto/create-direct-subscription.dto';
import {StripeService} from '@/stripe/stripe.service';

@Controller('subscriptions')
@ApiTags('Subscriptions')
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly stripeService: StripeService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('create-checkout-session')
  async createCheckout(
    @User() user: JwtPayload,
    @Body() dto: CreateCheckoutSessionDto,
  ) {
    return this.subscriptionsService.createCheckoutSession(user.sub, dto.priceId);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getUserSubscription(@User() user: JwtPayload) {
    return this.subscriptionsService.getUserSubscription(user.sub);
  }

  @Post('direct-create')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async directCreate(
    @User() user: JwtPayload,
    @Body() dto: CreateDirectSubscriptionDto,
  ) {
    const customer = await this.stripeService.getOrCreateCustomer(
      user.sub,
      user.email,
    );

    await this.stripeService.attachPaymentMethod(
      customer.id,
      dto.paymentMethodId,
    );

    const subscription = await this.stripeService.createSubscription(
      customer.id,
      dto.priceId,
    );
    await this.subscriptionsService.activateSubscription(
      user.sub,
      subscription.id,
    );

    return subscription;
  }
}
