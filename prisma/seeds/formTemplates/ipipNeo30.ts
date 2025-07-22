import { PrismaClient } from '../@prisma/client/client';
import {formTemplateConstants} from '../contants';

const prisma = new PrismaClient();

async function main() {
  const form = await prisma.formTemplate.create({
    data: {
      title: 'IPIP-NEO-30 – Evaluación de los 5 Grandes Rasgos de Personalidad',
      description: `Versión abreviada de dominio público del modelo de los Cinco Grandes. Evalúa apertura a la experiencia, responsabilidad, extraversión, amabilidad y neuroticismo. No hay respuestas correctas o incorrectas.`,
      isActive: true,
      createdBy: formTemplateConstants.ADMIN_ID, 
      questions: {
        create: [
          // Apertura
          { order: 1, type: 'MULTIPLE_CHOICE', text: 'Tengo una imaginación activa.', options: likert() },
          { order: 2, type: 'MULTIPLE_CHOICE', text: 'Disfruto reflexionar sobre cosas abstractas.', options: likert() },
          { order: 3, type: 'MULTIPLE_CHOICE', text: 'Valoro la belleza en el arte y la naturaleza.', options: likert() },
          { order: 4, type: 'MULTIPLE_CHOICE', text: 'Disfruto experimentar cosas nuevas.', options: likert() },
          { order: 5, type: 'MULTIPLE_CHOICE', text: 'Me interesan muchas cosas diferentes.', options: likert() },
          { order: 6, type: 'MULTIPLE_CHOICE', text: 'Prefiero ideas complejas a simples.', options: likert() },

          // Responsabilidad
          { order: 7, type: 'MULTIPLE_CHOICE', text: 'Presto atención a los detalles.', options: likert() },
          { order: 8, type: 'MULTIPLE_CHOICE', text: 'Hago las cosas con eficiencia.', options: likert() },
          { order: 9, type: 'MULTIPLE_CHOICE', text: 'Cumplo con mis responsabilidades a tiempo.', options: likert() },
          { order: 10, type: 'MULTIPLE_CHOICE', text: 'Me esfuerzo al máximo en lo que hago.', options: likert() },
          { order: 11, type: 'MULTIPLE_CHOICE', text: 'Mantengo mis pertenencias organizadas.', options: likert() },
          { order: 12, type: 'MULTIPLE_CHOICE', text: 'Planeo con anticipación.', options: likert() },

          // Extraversión
          { order: 13, type: 'MULTIPLE_CHOICE', text: 'Me siento cómodo/a rodeado/a de gente.', options: likert() },
          { order: 14, type: 'MULTIPLE_CHOICE', text: 'Me gusta ser el centro de atención.', options: likert() },
          { order: 15, type: 'MULTIPLE_CHOICE', text: 'Disfruto participar en muchas actividades sociales.', options: likert() },
          { order: 16, type: 'MULTIPLE_CHOICE', text: 'Hablo con facilidad con personas nuevas.', options: likert() },
          { order: 17, type: 'MULTIPLE_CHOICE', text: 'Soy entusiasta y lleno/a de energía.', options: likert() },
          { order: 18, type: 'MULTIPLE_CHOICE', text: 'Me siento animado/a en compañía de otros.', options: likert() },

          // Amabilidad
          { order: 19, type: 'MULTIPLE_CHOICE', text: 'Trato de llevarme bien con todos.', options: likert() },
          { order: 20, type: 'MULTIPLE_CHOICE', text: 'Soy compasivo/a con los demás.', options: likert() },
          { order: 21, type: 'MULTIPLE_CHOICE', text: 'Confío fácilmente en los demás.', options: likert() },
          { order: 22, type: 'MULTIPLE_CHOICE', text: 'Prefiero cooperar antes que competir.', options: likert() },
          { order: 23, type: 'MULTIPLE_CHOICE', text: 'Escucho con atención a los demás.', options: likert() },
          { order: 24, type: 'MULTIPLE_CHOICE', text: 'Perdono con facilidad.', options: likert() },

          // Neuroticismo
          { order: 25, type: 'MULTIPLE_CHOICE', text: 'Me siento ansioso/a con facilidad.', options: likert() },
          { order: 26, type: 'MULTIPLE_CHOICE', text: 'Suelo estar irritable.', options: likert() },
          { order: 27, type: 'MULTIPLE_CHOICE', text: 'Me preocupo por muchas cosas.', options: likert() },
          { order: 28, type: 'MULTIPLE_CHOICE', text: 'Me siento deprimido/a frecuentemente.', options: likert() },
          { order: 29, type: 'MULTIPLE_CHOICE', text: 'Me altero fácilmente.', options: likert() },
          { order: 30, type: 'MULTIPLE_CHOICE', text: 'A menudo me siento tenso/a o nervioso/a.', options: likert() },
        ],
      },
    },
  });

  console.log('✅ Formulario IPIP-NEO-30 creado:', form.id);
}

function likert() {
  return [
    '1. Totalmente en desacuerdo',
    '2. En desacuerdo',
    '3. Neutral',
    '4. De acuerdo',
    '5. Totalmente de acuerdo',
  ];
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
