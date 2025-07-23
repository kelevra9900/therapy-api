import {Injectable,NotFoundException} from '@nestjs/common';
import Stripe from 'stripe';

import {StripeService} from '@/stripe/stripe.service';
import {PrismaService} from '@/prisma/prisma.service';
import {PaymentMethod,Subscription,SubscriptionStatus} from 'generated/prisma';

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
      // Find the user id
    const user = await this.prisma.user.findUnique({
      where: {id: userId},
      select: {id: true, subscriptionStatus: true},
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the user already has an active subscription
    const existingSubscription: Subscription | any = await this.prisma.subscription.findFirst({
      where: {
        userId, 
        status: SubscriptionStatus.ACTIVE,
        nextBillingDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    },
    });


    if (existingSubscription) {
      throw new NotFoundException(`User with ID ${userId} already has an active subscription`);
    }

    const price =  process.env.STRIPE_PRICE_ID || 'default_price_id';

    // Create a membership if it doesn't exist
    const membership = await this.prisma.membership.findFirst({
      where: {
        stripePriceId: price,
      },
    });

    if (!membership) {
      const newMembership = await this.prisma.membership.create({
        data: {
          name: 'Default Membership',
          stripePriceId: price,
          description:'Default description',
          priceMonthly: 0,
          priceYearly: 1500,
        },
      });


      // Associate the new membership with the subscription
      if(!existingSubscription) {
      await this.prisma.subscription.create({
        data: {
          userId: user.id,
          membershipId: newMembership.id,
          status: SubscriptionStatus.ACTIVE,
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
          paymentMethod: PaymentMethod.CARD,
          // nextBillingDate must be set to the next year
          nextBillingDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      });
      }else {
      // if subscription already exists, just update the membership

    }
      await this.prisma.user.update({
        where: {id: user.id},
        data: {
          subscriptionStatus: SubscriptionStatus.ACTIVE,
        },
      });
      return newMembership;
    }

    const existingSub = await this.prisma.subscription.findFirst({
      where: { userId },
    });

    const subscription = await this.prisma.subscription.upsert({
      where: {
        id: existingSub ? existingSub.id : 'non-existent-id', // Use a dummy id if not found, will trigger create
      },
      update: {
        membershipId: membership.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        paymentMethod: PaymentMethod.CARD,
        nextBillingDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        externalPaymentId: externalSubscriptionId,
      },
      create: {
        userId: user.id,
        membershipId: membership.id,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        paymentMethod: PaymentMethod.CARD,
        nextBillingDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),   
        externalPaymentId: externalSubscriptionId,
      },
    });

    await this.prisma.user.update({
      where: {id: user.id},
      data: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      },
    });
    return subscription;

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
