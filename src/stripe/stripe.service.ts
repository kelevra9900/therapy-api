import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
  });

  getClient() {
    return this.stripe;
  }

  async createCheckoutSession({
    userId,
    priceId,
    successUrl,
    cancelUrl,
  }: {
    userId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    return this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: await this.getUserEmail(userId), // opcional: puedes vincular customer
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  private async getUserEmail(userId: string) {
    // Consultar desde Prisma si no tienes el email a la mano
    return 'email@example.com';
  }

  async getOrCreateCustomer(userId: string, email: string) {
    // Busca si ya lo tienes guardado con metadata
    const customers = await this.stripe.customers.list({
      limit: 1,
      email,
    });

    if (customers.data.length) return customers.data[0];

    return this.stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string) {
    await this.stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    await this.stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    });
  }
}
