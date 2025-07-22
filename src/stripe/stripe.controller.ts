import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  HttpCode,
  Body,
  UseGuards,
  Logger,
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
  private readonly logger = new Logger(StripeController.name);
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: '2025-04-30.basil',
  });


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
        process.env.STRIPE_WEBHOOK_SECRET || '',
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
        const stripeSubscriptionId = session.subscription as string;

        if (!userId) {
          this.logger.warn('No se encontró el userId en metadata');
          return;
        }

        this.logger.log('✅ checkout.session.completed',{
          userId,
          stripeSubscriptionId,
        });


        await this.subscriptionsService.activateSubscription(
          userId,
          stripeSubscriptionId,
        );
        break;
      }
      case 'invoice.payment_succeeded': {
        this.logger.log(`invoice.payment_succeeded: ${event.type}`);

        const invoice = event.data.object as Stripe.Invoice & {subscription?: string};
        const subscriptionId = invoice.parent?.subscription_details?.subscription;
        const userId = invoice.metadata?.userId;  

        if (!subscriptionId || typeof subscriptionId !== 'string') {
          this.logger.warn('Subscription ID not found in succeeded invoice event');
        }

        if (!userId) {
          this.logger.warn('User ID not found in succeeded invoice event');
          return;
        }

        this.logger.log(`Activating subscription ${subscriptionId} for user ${userId}`);
        // Create a payment log

        // Aquí puedes manejar el pago exitoso de la factura
        break;
      }
      case 'invoice.payment_failed': {
        this.logger.log(`invoice.payment_failed: ${event.type}`);
        const invoice = event.data.object as Stripe.Invoice & {subscription?: string};
        const subscriptionId = invoice.parent?.subscription_details?.subscription;

        if (subscriptionId && typeof subscriptionId === 'string') {
          await this.subscriptionsService.markAsPastDue(subscriptionId);
          this.logger.log(`Marked subscription ${subscriptionId} as past due`);
          // await this.subscriptionsService.activateSubscription(userId, subscriptionId);
        } else {
          console.warn('Subscription ID not found in failed invoice event');
        }

        break;
      }
    //invoice.payment_succeeded
      case 'invoice.payment_succeeded': {
        this.logger.log(`invoice.payment_succeeded: ${event.type}`);
        const invoice = event.data.object as Stripe.Invoice & {subscription?: string};
        const subscriptionId = invoice.parent?.subscription_details?.subscription; 
        const userId = invoice.metadata?.userId;
        if (subscriptionId && typeof subscriptionId === 'string' && userId) {
          await this.subscriptionsService.activateSubscription(userId, subscriptionId);
          this.logger.log(`Activated subscription ${subscriptionId} for user ${userId}`);
        } else {
          console.warn('Subscription ID not found in succeeded invoice event');
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.json({received: true});
  }
}
