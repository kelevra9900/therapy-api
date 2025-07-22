
import {PrismaClient,Role,Gender,User,Client,Question} from '../generated/prisma/client';
import * as dotenv from 'dotenv';

import Stripe from 'stripe';
import {faker} from '@faker-js/faker';

const prisma = new PrismaClient({
  log: ['query'],
});


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
  apiVersion: '2025-06-30.basil',
});

async function main() {
  dotenv.config();
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
      where: {stripePriceId: price.id},
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
      const shouldUpdate =
        existing.name !== name ||
        existing.description !== description ||
        existing.priceMonthly !== priceMonthly ||
        JSON.stringify(existing.features) !== JSON.stringify(features);

      if (shouldUpdate) {
        await prisma.membership.update({
          where: {id: existing.id},
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

  console.log('👥 Creando terapeutas y clientes...');
  const terapeutas: User[] = [];

  for (let i = 0; i < 3; i++) {
    const t = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: 'hashed_password',
        role: Role.THERAPIST,
        subscriptionStatus: 'ACTIVE',
        isActive: true,
      },
    });
    terapeutas.push(t);
  }

  const clientesCreados: Client[] = [];
  for (const therapist of terapeutas) {
    for (let j = 0; j < 5; j++) {
      const c = await prisma.client.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          birthDate: faker.date.birthdate({min: 18,max: 65,mode: 'age'}),
          gender: faker.helpers.arrayElement([Gender.MALE,Gender.FEMALE]),
          notes: faker.lorem.sentence(),
          therapistId: therapist.id,
        },
      });
      clientesCreados.push(c);
    }
  }

  console.log('🧠 Creando formulario SCOFF...');
  const scoffForm = await prisma.formTemplate.create({
    data: {
      title: 'SCOFF – Cuestionario de detección de trastornos alimentarios',
      description: 'Cuestionario breve de 5 preguntas. Una respuesta afirmativa indica 1 punto. Dos o más puntos indican posible trastorno alimentario.',
      isActive: true,
      createdBy: terapeutas[0].id,
      questions: {
        create: [
          {
            text: '¿Te provocas el vómito porque te sientes muy lleno/a?',
            type: 'MULTIPLE_CHOICE',
            order: 1,
            options: ['Sí','No']
          },
          {
            text: '¿Te preocupa haber perdido el control sobre cuánto comes?',
            type: 'MULTIPLE_CHOICE',
            order: 2,
            options: ['Sí','No']
          },
          {
            text: '¿Has perdido más de 6 kg (aproximadamente una talla de ropa) en un período de 3 meses?',
            type: 'MULTIPLE_CHOICE',
            order: 3,
            options: ['Sí','No']
          },
          {
            text: '¿Crees que estás gordo/a, aunque otras personas digan que estás muy delgado/a?',
            type: 'MULTIPLE_CHOICE',
            order: 4,
            options: ['Sí','No']
          },
          {
            text: '¿Dirías que la comida domina tu vida?',
            type: 'MULTIPLE_CHOICE',
            order: 5,
            options: ['Sí','No']
          },
        ]
      }
    },
    include: {questions: true}
  });

  const scoffQuestions = scoffForm.questions;

  console.log('📝 Generando respuestas SCOFF para clientes...');

  for (const client of clientesCreados) {
    const answersRaw: {questionId: string; answer: string}[] = [];
    let score = 0;

    const responses = [
      {order: 1,answer: Math.random() < 0.5 ? "Sí" : "No"},
      {order: 2,answer: Math.random() < 0.5 ? "Sí" : "No"},
      {order: 3,answer: Math.random() < 0.5 ? "Sí" : "No"},
      {order: 4,answer: Math.random() < 0.5 ? "Sí" : "No"},
      {order: 5,answer: Math.random() < 0.5 ? "Sí" : "No"},
    ];

    for (const r of responses) {
      const q: Question = scoffQuestions.find(q => q.order === r.order) as Question;
      answersRaw.push({
        questionId: q.id,
        answer: r.answer
      });
      if (r.answer === "Sí") score++;
    }

    const level = score >= 2 ? "MODERATE" : "MINIMAL";

    await prisma.formResponse.create({
      data: {
        clientId: client.id,
        therapistId: client.therapistId,
        formTemplateId: scoffForm.id,
        score,
        level,
        answers: {
          create: answersRaw
        }
      }
    });

    console.log(`🧾 SCOFF → Cliente: ${client.name}, Score: ${score}, Nivel: ${level}`);
  }

  console.log('✅ Seed completo.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

