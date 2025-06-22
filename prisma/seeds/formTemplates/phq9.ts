import { PrismaClient } from '../../../generated/prisma/client';
import {formTemplateConstants} from '../contants';

const prisma = new PrismaClient();

async function main() {
  const createdBy = formTemplateConstants.ADMIN_ID;

  const existing = await prisma.formTemplate.findFirst({
    where: {
      title: 'PHQ-9 – Depresión'
    }
  });

  if (existing) {
    console.log('El formulario PHQ-9 ya existe.');
    return;
  }

  const form = await prisma.formTemplate.create({
    data: {
      title: 'PHQ-9 – Depresión',
      description:
        'Instrucciones: Contesta cada ítem según la frecuencia con la que has experimentado los síntomas en las últimas dos semanas.\n\nInterpretación: Puntajes: 0–4 (mínima), 5–9 (leve), 10–14 (moderada), 15–19 (moderadamente grave), 20–27 (grave).',
      isActive: true,
      createdBy,
      questions: {
        create: [
          { text: 'Poco interés o placer en hacer cosas.', type: 'MULTIPLE_CHOICE', order: 1, options: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'] },
          { text: 'Sentirse decaído, deprimido o sin esperanzas.', type: 'MULTIPLE_CHOICE', order: 2, options: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'] },
          { text: 'Dificultad para dormir o dormir demasiado.', type: 'MULTIPLE_CHOICE', order: 3, options: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'] },
          { text: 'Sentirse cansado o tener poca energía.', type: 'MULTIPLE_CHOICE', order: 4, options: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'] },
          { text: 'Falta de apetito o comer en exceso.', type: 'MULTIPLE_CHOICE', order: 5, options: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'] },
          { text: 'Sentirse mal consigo mismo o que es un fracaso.', type: 'MULTIPLE_CHOICE', order: 6, options: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'] },
          { text: 'Dificultad para concentrarse en cosas.', type: 'MULTIPLE_CHOICE', order: 7, options: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'] },
          { text: 'Moverse o hablar tan lento que otros lo noten o lo opuesto, estar muy inquieto.', type: 'MULTIPLE_CHOICE', order: 8, options: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'] },
          { text: 'Pensamientos de que estaría mejor muerto o de hacerse daño de alguna manera.', type: 'MULTIPLE_CHOICE', order: 9, options: ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'] }
        ]
      }
    }
  });

  console.log('Formulario PHQ-9 creado con ID:', form.id);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
