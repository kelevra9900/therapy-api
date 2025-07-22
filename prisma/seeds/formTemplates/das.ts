import { PrismaClient } from '../@prisma/client/client';
import {formTemplateConstants} from '../contants';

const prisma = new PrismaClient();

async function main() {
  const form = await prisma.formTemplate.create({
    data: {
      title: 'DAS Abreviada – Satisfacción en pareja',
      description:
        'Responde según el grado de satisfacción con tu relación de pareja. Puntajes menores de 28 sugieren posible insatisfacción en la relación.',
      isActive: true,
      createdBy: formTemplateConstants.ADMIN_ID,
      questions: {
        create: [
          {
            text: '¿Qué tan satisfecho estás con tu relación de pareja?',
            type: 'MULTIPLE_CHOICE',
            order: 1,
            options: ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho'],
          },
          {
            text: '¿Qué tan bien se entienden tú y tu pareja?',
            type: 'MULTIPLE_CHOICE',
            order: 2,
            options: ['Nada', 'Poco', 'Moderadamente', 'Bastante', 'Mucho'],
          },
          {
            text: '¿Qué tan frecuente son los desacuerdos entre ustedes?',
            type: 'MULTIPLE_CHOICE',
            order: 3,
            options: ['Muy frecuentes', 'Frecuentes', 'Ocasionales', 'Raros', 'Nunca'],
          },
          {
            text: '¿Qué tan satisfecho estás con la manera en que se toman decisiones juntos?',
            type: 'MULTIPLE_CHOICE',
            order: 4,
            options: ['Muy insatisfecho', 'Insatisfecho', 'Neutral', 'Satisfecho', 'Muy satisfecho'],
          },
          {
            text: '¿Cómo calificarías la calidad general de tu relación?',
            type: 'MULTIPLE_CHOICE',
            order: 5,
            options: ['Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'],
          },
        ],
      },
    },
  });

  console.log('🧠 DAS Abreviada – formulario creado:', form.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
