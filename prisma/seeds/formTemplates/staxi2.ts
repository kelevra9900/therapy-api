import { PrismaClient } from '../@prisma/client/client';
import {formTemplateConstants} from '../contants';

const prisma = new PrismaClient();

async function main() {
  const form = await prisma.formTemplate.create({
    data: {
      title: 'STAXI-2 Corta – Inventario de Ira Estado-Rasgo (versión breve)',
      description:
        'Evalúa la intensidad y el control de la ira en las últimas semanas. Útil para detectar dificultades en el manejo de la ira.',
      isActive: true,
      createdBy: formTemplateConstants.ADMIN_ID,
      questions: {
        create: [
          {
            order: 1,
            type: 'MULTIPLE_CHOICE',
            text: 'Me siento irritado/a.',
            options: likertScale(),
          },
          {
            order: 2,
            type: 'MULTIPLE_CHOICE',
            text: 'Me cuesta controlar mi enojo.',
            options: likertScale(),
          },
          {
            order: 3,
            type: 'MULTIPLE_CHOICE',
            text: 'Me siento furioso/a por cosas pequeñas.',
            options: likertScale(),
          },
          {
            order: 4,
            type: 'MULTIPLE_CHOICE',
            text: 'Puedo calmarme rápidamente después de enojarme.',
            options: likertScale(),
          },
          {
            order: 5,
            type: 'MULTIPLE_CHOICE',
            text: 'Siento que la ira me domina a veces.',
            options: likertScale(),
          },
        ],
      },
    },
  });

  console.log('✅ Formulario STAXI-2 creado:', form.id);
}

function likertScale() {
  return ['Nunca', 'Rara vez', 'Algunas veces', 'Frecuentemente', 'Siempre'];
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
