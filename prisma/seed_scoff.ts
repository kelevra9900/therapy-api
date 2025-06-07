import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.formTemplate.create({
    data: {
      title: `SCOFF – Cuestionario de detección de trastornos alimentarios`,
      description: `Cuestionario breve de 5 preguntas. Una respuesta afirmativa indica 1 punto. Dos o más puntos indican posible trastorno alimentario.`,
      isActive: true,
      createdBy: "3e772d49-4cff-48ec-86c5-409c90dda773",
      questions: {
        create: [
          {
            text: `¿Te provocas el vómito porque te sientes muy lleno/a?`,
            type: "MULTIPLE_CHOICE",
            order: 1,
            options: ["S\u00ed", "No"]
          },
          {
            text: `¿Te preocupa haber perdido el control sobre cuánto comes?`,
            type: "MULTIPLE_CHOICE",
            order: 2,
            options: ["S\u00ed", "No"]
          },
          {
            text: `¿Has perdido más de 6 kg (aproximadamente una talla de ropa) en un período de 3 meses?`,
            type: "MULTIPLE_CHOICE",
            order: 3,
            options: ["S\u00ed", "No"]
          },
          {
            text: `¿Crees que estás gordo/a, aunque otras personas digan que estás muy delgado/a?`,
            type: "MULTIPLE_CHOICE",
            order: 4,
            options: ["S\u00ed", "No"]
          },
          {
            text: `¿Dirías que la comida domina tu vida?`,
            type: "MULTIPLE_CHOICE",
            order: 5,
            options: ["S\u00ed", "No"]
          },
        ]
      }
    }
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
