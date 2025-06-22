import {PrismaClient} from '../../../generated/prisma/client';
import {formTemplateConstants} from '../contants';

const prisma = new PrismaClient();

const CAGE_AID_QUESTIONS = [
  '¿Alguna vez has sentido que debías reducir tu consumo de alcohol o drogas?',
  '¿Te ha molestado que la gente te critique por tu forma de consumir?',
  '¿Alguna vez te has sentido culpable por tu consumo de alcohol o drogas?',
  '¿Alguna vez has necesitado tomar alcohol o consumir alguna droga al despertarte para calmarte o comenzar el día (lo que se conoce como “eye-opener”)?',
];

const CAGE_AID_OPTIONS = ['Sí', 'No'];

async function main() {
  console.log('🔍 Buscando formulario CAGE-AID existente...');
  const existing = await prisma.formTemplate.findFirst({
    where: {
      title: {
        contains: 'CAGE-AID',
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    console.log('⚠️  El formulario CAGE-AID ya existe. Abortando.');
    return;
  }

  console.log('🚀 Creando formulario CAGE-AID – Detección de Consumo de Sustancias...');
  const form = await prisma.formTemplate.create({
    data: {
      title: 'CAGE-AID – Detección Breve de Consumo de Sustancias',
      description:
        'Contesta pensando en tu consumo de alcohol o drogas. Responde “Sí” o “No” a cada pregunta.\n\nInterpretación:\n- 1 punto por cada “Sí”\n- 2 o más puntos indican posible consumo problemático. Requiere una evaluación más profunda.',
      isActive: true,
      createdBy: formTemplateConstants.ADMIN_ID,
      questions: {
        create: CAGE_AID_QUESTIONS.map((text, index) => ({
          text,
          type: 'MULTIPLE_CHOICE',
          order: index + 1,
          options: CAGE_AID_OPTIONS,
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  console.log(`✅ Formulario CAGE-AID creado con ID: ${form.id}`);
  console.log(`🧠 Preguntas agregadas: ${form.questions.length}`);
}

main()
  .then(() => {
    console.log('🎉 Seed completado exitosamente.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error al ejecutar el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
