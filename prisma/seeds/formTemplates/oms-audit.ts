import { PrismaClient } from '@prisma/client';
import {formTemplateConstants} from '../contants';

const prisma = new PrismaClient();

const AUDIT_QUESTIONS = [
  '¿Con qué frecuencia consumes alguna bebida alcohólica?',
  'Cuando tomas, ¿cuántas bebidas alcohólicas consumes en un día típico?',
  '¿Con qué frecuencia tomas seis o más bebidas en una sola ocasión?',
  '¿Con qué frecuencia en el último año has sentido que no podías parar de beber una vez que empezabas?',
  '¿Con qué frecuencia en el último año no pudiste hacer lo que normalmente se esperaba de ti debido a la bebida?',
  '¿Con qué frecuencia has necesitado beber por la mañana para poder empezar el día después de una noche de consumo?',
  '¿Con qué frecuencia has sentido culpa o remordimiento después de beber?',
  '¿Con qué frecuencia no pudiste recordar lo que ocurrió la noche anterior debido a la bebida?',
  '¿Tú o alguien más ha resultado herido por causa de tu consumo de alcohol?',
  '¿Algún familiar, amigo, médico o profesional de salud te ha sugerido que reduzcas tu consumo de alcohol?',
];

const AUDIT_OPTIONS = [
  ['Nunca (0)', 'Una vez al mes o menos (1)', '2–4 veces al mes (2)', '2–3 veces a la semana (3)', '4 o más veces a la semana (4)'],
  ['1 o 2 (0)', '3 o 4 (1)', '5 o 6 (2)', '7 a 9 (3)', '10 o más (4)'],
  ['Nunca (0)', 'Menos de una vez al mes (1)', 'Mensualmente (2)', 'Semanalmente (3)', 'Diariamente o casi diariamente (4)'],
  ['Nunca (0)', 'Menos de una vez al mes (1)', 'Mensualmente (2)', 'Semanalmente (3)', 'Diariamente o casi diariamente (4)'],
  ['Nunca (0)', 'Menos de una vez al mes (1)', 'Mensualmente (2)', 'Semanalmente (3)', 'Diariamente o casi diariamente (4)'],
  ['Nunca (0)', 'Menos de una vez al mes (1)', 'Mensualmente (2)', 'Semanalmente (3)', 'Diariamente o casi diariamente (4)'],
  ['Nunca (0)', 'Menos de una vez al mes (1)', 'Mensualmente (2)', 'Semanalmente (3)', 'Diariamente o casi diariamente (4)'],
  ['Nunca (0)', 'Menos de una vez al mes (1)', 'Mensualmente (2)', 'Semanalmente (3)', 'Diariamente o casi diariamente (4)'],
  ['No (0)', 'Sí, pero no en el último año (2)', 'Sí, en el último año (4)'],
  ['No (0)', 'Sí, pero no en el último año (2)', 'Sí, en el último año (4)'],
];

async function main() {
  console.log('🔍 Buscando si el formulario AUDIT ya existe...');
  const exists = await prisma.formTemplate.findFirst({
    where: {
      title: {
        contains: 'AUDIT',
        mode: 'insensitive',
      },
    },
  });

  if (exists) {
    console.log('⚠️  Ya existe un formulario con el título AUDIT. Abortando creación.');
    return;
  }

  console.log('✅ Creando formulario AUDIT...');
  const form = await prisma.formTemplate.create({
    data: {
      title: `AUDIT – Cuestionario para Identificación de Trastornos por Consumo de Alcohol (OMS)`,
      description: `Evalúa el consumo de alcohol en los últimos 12 meses. Puntuación total de 0 a 40. Resultados:
- 0–7: Consumo bajo o moderado
- 8–15: Consumo riesgoso
- 16–19: Consumo nocivo
- 20 o más: Posible dependencia del alcohol`,
      isActive: true,
      createdBy: formTemplateConstants.ADMIN_ID,
      questions: {
        create: AUDIT_QUESTIONS.map((text, index) => ({
          text,
          type: 'MULTIPLE_CHOICE',
          order: index + 1,
          options: AUDIT_OPTIONS[index],
        })),
      },
    },
    include: {
      questions: true,
    },
  });

  console.log(`✅ Formulario AUDIT creado con ID: ${form.id}`);
  console.log(`📝 Se crearon ${form.questions.length} preguntas.`);
}

main()
  .then(() => {
    console.log('🎉 Seed ejecutado correctamente.');
    return prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error en el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
