import { PrismaClient } from '../@prisma/client/client';
import {formTemplateConstants} from '../contants';

const prisma = new PrismaClient();

async function main() {
  const createdBy = formTemplateConstants.ADMIN_ID

  const gad7 = await prisma.formTemplate.create({
    data: {
      title: 'GAD-7 – Ansiedad',
      description:
        'Instrucciones: Marca con qué frecuencia te han molestado los siguientes problemas durante las últimas dos semanas.',
      isActive: true,
      createdBy,
      questions: {
        create: [
          {
            text: '1. Sentirse nervioso, ansioso o al borde.',
            type: 'MULTIPLE_CHOICE',
            order: 1,
            options: ['Nunca (0)', 'Varios días (1)', 'Más de la mitad de los días (2)', 'Casi todos los días (3)'],
          },
          {
            text: '2. No poder parar o controlar las preocupaciones.',
            type: 'MULTIPLE_CHOICE',
            order: 2,
            options: ['Nunca (0)', 'Varios días (1)', 'Más de la mitad de los días (2)', 'Casi todos los días (3)'],
          },
          {
            text: '3. Preocuparse demasiado por diferentes cosas.',
            type: 'MULTIPLE_CHOICE',
            order: 3,
            options: ['Nunca (0)', 'Varios días (1)', 'Más de la mitad de los días (2)', 'Casi todos los días (3)'],
          },
          {
            text: '4. Dificultad para relajarse.',
            type: 'MULTIPLE_CHOICE',
            order: 4,
            options: ['Nunca (0)', 'Varios días (1)', 'Más de la mitad de los días (2)', 'Casi todos los días (3)'],
          },
          {
            text: '5. Estar tan inquieto que es difícil quedarse quieto.',
            type: 'MULTIPLE_CHOICE',
            order: 5,
            options: ['Nunca (0)', 'Varios días (1)', 'Más de la mitad de los días (2)', 'Casi todos los días (3)'],
          },
          {
            text: '6. Irritarse fácilmente o sentirse molesto con facilidad.',
            type: 'MULTIPLE_CHOICE',
            order: 6,
            options: ['Nunca (0)', 'Varios días (1)', 'Más de la mitad de los días (2)', 'Casi todos los días (3)'],
          },
          {
            text: '7. Sentir miedo como si algo terrible pudiera pasar.',
            type: 'MULTIPLE_CHOICE',
            order: 7,
            options: ['Nunca (0)', 'Varios días (1)', 'Más de la mitad de los días (2)', 'Casi todos los días (3)'],
          },
        ],
      },
    },
  });

  console.log('Formulario GAD-7 creado:', gad7.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
