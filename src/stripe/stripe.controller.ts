import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpCode,
  Body,
  UseGuards,
} from '@nestjs/common';
import Stripe from 'stripe';
import {Request,Response} from 'express';
import {ApiBearerAuth,ApiTags} from '@nestjs/swagger';
import {Role} from '@prisma/index';

import {StripeService} from './stripe.service';
import {PaymentsService} from '@/payments/payments.service';
import {SubscriptionsService} from '@/subscriptions/subscriptions.service';
import {JwtPayload} from '@/auth/types';
import {User} from '@/common/decorators/user.decorator';
import {AuthGuard} from '@/auth/auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/roles.decorator';
import {CreateDirectSubscriptionDto} from '@/subscriptions/dto/create-direct-subscription.dto';


@Controller('webhook')
@ApiTags('Subscriptions')
@ApiBearerAuth()
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private paymentsService: PaymentsService,
    private subscriptionsService: SubscriptionsService,
  ) { }

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripeService.getClient().webhooks.constructEvent(
        (req as any).body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      console.error('Webhook signature verification failed:',err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // 🔁 Manejamos eventos clave
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          await this.subscriptionsService.activateSubscription(userId,subscriptionId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.paymentsService.logPayment({
          subscriptionId: invoice.id as string,
          amount: invoice.amount_paid / 100,
          method: 'CARD',
          status: 'PAID',
          paidAt: new Date(invoice.created * 1000),
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await this.subscriptionsService.markAsPastDue(invoice.id as string);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({received: true});
  }
}
