import {Injectable,NotFoundException} from '@nestjs/common';
import Stripe from 'stripe';

import {StripeService} from '@/stripe/stripe.service';
import {PrismaService} from '@/prisma/prisma.service';
import {PaymentMethod,SubscriptionStatus} from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) { }

  async createCheckoutSession(userId: string,priceId: string) {
    const session = await this.stripeService.createCheckoutSession({
      userId,
      priceId,
      successUrl: `${process.env.FRONTEND_URL}/subscription/success`,
      cancelUrl: `${process.env.FRONTEND_URL}/subscription/cancel`,
    });

    return {url: session.url};
  }

  async getUserSubscription(userId: string) {
    return this.prisma.subscription.findFirst({
      where: {userId},
      include: {membership: true},
    });
  }

  async activateSubscription(userId: string,externalSubscriptionId: string) {
    const stripe = this.stripeService.getClient();

    const subscription = await stripe.subscriptions.retrieve(externalSubscriptionId,{
      expand: ['items.data.price.product'],
    });

    const productId = (subscription.items.data[0]?.price?.product as Stripe.Product)?.id;

    if (!productId) {
      throw new NotFoundException('Stripe product not found in subscription');
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        stripePriceId: subscription.items.data[0]?.price?.id,
      },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found for Stripe price');
    }

    await this.prisma.subscription.create({
      data: {
        userId,
        membershipId: membership.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(subscription.start_date * 1000),
        endDate: subscription.cancel_at
          ? new Date(subscription.cancel_at * 1000)
          : null,
        nextBillingDate: subscription.ended_at
          ? new Date(subscription.ended_at * 1000)
          : null,
        paymentMethod: PaymentMethod.CARD,
        externalPaymentId: externalSubscriptionId,
      },
    });


    await this.prisma.user.update({
      where: {id: userId},
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    });
  }

  async markAsPastDue(externalSubscriptionId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {externalPaymentId: externalSubscriptionId},
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with Stripe ID ${externalSubscriptionId} not found`);
    }

    await this.prisma.subscription.update({
      where: {id: subscription.id},
      data: {
        status: SubscriptionStatus.PAST_DUE,
      },
    });

    await this.prisma.user.update({
      where: {id: subscription.userId},
      data: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
      },
    });
  }
}
