import { PrismaClient } from '@prisma/client';
import {formTemplateConstants} from '../constants';

const prisma = new PrismaClient();

async function main() {
  const form = await prisma.formTemplate.create({
    data: {
      title: 'CTS2 Abreviada – Escala de tácticas de conflicto para parejas',
      description:
        'Evalúa tácticas verbales y físicas utilizadas en conflictos de pareja durante los últimos 12 meses.',
      isActive: true,
      createdBy: formTemplateConstants.ADMIN_ID, // ← Reemplázalo por tu UUID real
      questions: {
        create: [
          {
            order: 1,
            type: 'MULTIPLE_CHOICE',
            text: '¿Has gritado o insultado a tu pareja?',
            options: frequencyScale(),
          },
          {
            order: 2,
            type: 'MULTIPLE_CHOICE',
            text: '¿Has empujado, agarrado o sujetado a tu pareja?',
            options: frequencyScale(),
          },
          {
            order: 3,
            type: 'MULTIPLE_CHOICE',
            text: '¿Has golpeado a tu pareja?',
            options: frequencyScale(),
          },
          {
            order: 4,
            type: 'MULTIPLE_CHOICE',
            text: '¿Tu pareja ha usado amenazas para controlarte?',
            options: frequencyScale(),
          },
          {
            order: 5,
            type: 'MULTIPLE_CHOICE',
            text: '¿Tu pareja ha destruido tus cosas o las suyas en una pelea?',
            options: frequencyScale(),
          },
        ],
      },
    },
  });

  console.log('✅ Formulario CTS2 creado:', form.id);
}

function frequencyScale() {
  return ['Nunca', 'Una vez', 'Dos veces', 'Tres o más veces'];
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
