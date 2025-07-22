import { PrismaClient } from '../@prisma/client/client';
import {formTemplateConstants} from '../contants';

const prisma = new PrismaClient();

async function main() {
  const form = await prisma.formTemplate.create({
    data: {
      title: 'K10 – Kessler Psychological Distress Scale',
      description: `Evalúa el nivel general de malestar psicológico en las últimas 4 semanas. Las respuestas se califican del 1 (ninguna vez) al 5 (todo el tiempo).`,
      isActive: true,
      createdBy: formTemplateConstants.ADMIN_ID,
      questions: {
        create: [
          {
            order: 1,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido cansado/a sin razón?',
            options: likert(),
          },
          {
            order: 2,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido nervioso/a?',
            options: likert(),
          },
          {
            order: 3,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido tan nervioso/a que no podías tranquilizarte?',
            options: likert(),
          },
          {
            order: 4,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido desesperanzado/a?',
            options: likert(),
          },
          {
            order: 5,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido inquieto/a o impaciente?',
            options: likert(),
          },
          {
            order: 6,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido tan inquieto/a que no podías quedarte quieto/a?',
            options: likert(),
          },
          {
            order: 7,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido deprimido/a?',
            options: likert(),
          },
          {
            order: 8,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido que todo requiere mucho esfuerzo?',
            options: likert(),
          },
          {
            order: 9,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido triste que nada podía animarte?',
            options: likert(),
          },
          {
            order: 10,
            type: 'MULTIPLE_CHOICE',
            text: '¿Con qué frecuencia te has sentido que no vales nada?',
            options: likert(),
          },
        ],
      },
    },
  });

  console.log('✅ Formulario K10 creado:', form.id);
}

function likert() {
  return [
    '1. Ninguna vez',
    '2. Algunas veces',
    '3. Parte del tiempo',
    '4. La mayor parte del tiempo',
    '5. Todo el tiempo',
  ];
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
