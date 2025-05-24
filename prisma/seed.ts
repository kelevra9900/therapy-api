import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

async function main() {
  console.log('🔄 Sincronizando membresías con Stripe...');

  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    limit: 100,
  });

  for (const price of prices.data) {
    const product = price.product as Stripe.Product;

    if (!product || !product.name || price.unit_amount === null) continue;

    const name = product.name;
    const description = product.description || '';
    const priceMonthly = price.unit_amount / 100;
    const features: string[] = product.metadata?.features
      ? product.metadata.features.split(',').map(f => f.trim())
      : [];

    const existing = await prisma.membership.findFirst({
      where: { stripePriceId: price.id },
    });

    if (!existing) {
      await prisma.membership.create({
        data: {
          name,
          description,
          priceMonthly,
          features,
          stripePriceId: price.id,
        },
      });
      console.log(`➕ Creada: ${name}`);
    } else {
      // Solo actualiza si hay diferencias
      const shouldUpdate =
        existing.name !== name ||
        existing.description !== description ||
        existing.priceMonthly !== priceMonthly ||
        JSON.stringify(existing.features) !== JSON.stringify(features);

      if (shouldUpdate) {
        await prisma.membership.update({
          where: { id: existing.id },
          data: {
            name,
            description,
            priceMonthly,
            features,
          },
        });
        console.log(`🔁 Actualizada: ${name}`);
      } else {
        console.log(`✅ Sin cambios: ${name}`);
      }
    }
  }

  console.log('✅ Sincronización completada.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
