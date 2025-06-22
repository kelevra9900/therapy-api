import {PrismaClient} from '../../../generated/prisma/client';
import {formTemplateConstants} from '../contants';

const prisma = new PrismaClient();

const BIS11_QUESTIONS = [
  'Me cuesta esperar mi turno.',
  'Actúo sin pensar en las consecuencias.',
  'Me distraigo fácilmente.',
  'A menudo hago las cosas de forma impulsiva.',
  'Cambio de idea con rapidez.',
];

const BIS11_OPTIONS = [
  '1 = Nunca',
  '2 = Rara vez',
  '3 = Algunas veces',
  '4 = Frecuentemente',
  '5 = Siempre',
];

async function main() {
  console.log('🔎 Verificando si ya existe el formulario BIS-11...');
  const exists = await prisma.formTemplate.findFirst({
    where: {
      title: {
        contains: 'BIS-11 corta',
        mode: 'insensitive',
      },
    },
  });

  if (exists) {
    console.log('⚠️  El formulario BIS-11 ya existe. Abortando.');
    return;
  }

  console.log('🚀 Creando formulario BIS-11 corta – Escala de Impulsividad...');
  const form = await prisma.formTemplate.create({
    data: {
      title: 'BIS-11 corta – Escala de impulsividad',
      description: `Marca qué tan cierto es para ti cada frase.\n\nInterpretación:\n- Puntuaciones altas reflejan impulsividad significativa, como falta de planificación, distracción o decisiones precipitadas.\n- Puede impactar negativamente en salud, relaciones y desempeño laboral.`,
      isActive: true,
      createdBy: formTemplateConstants.ADMIN_ID,
      questions: {
        create: BIS11_QUESTIONS.map((text, index) => ({
          text,
          type: 'MULTIPLE_CHOICE',
          order: index + 1,
          options: BIS11_OPTIONS,
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  console.log(`✅ Formulario BIS-11 creado con ID: ${form.id}`);
  console.log(`📝 Se añadieron ${form.questions.length} preguntas.`);
}

main()
  .then(() => {
    console.log('🎉 Seed completado correctamente.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
