// import {PrismaClient} from '@prisma/client';
// import {formTemplateConstants} from '../constants';

// const prisma = new PrismaClient();

// async function main() {
//   await prisma.formTemplate.create({
//     data: {
//       title: `ASRS v1.1 – Escala de Autorreporte para TDAH en Adultos (Parte A)`,
//       description: `Escala breve de 10 ítems para detectar posibles síntomas de TDAH en adultos. Los primeros 6 ítems son parte del cribado. Se recomienda una evaluación clínica si 4 o más ítems se responden como “Frecuentemente” o “Muy frecuentemente”.`,
//       isActive: true,
//       createdBy: formTemplateConstants.ADMIN_ID,
//       questions: {
//         create: ASRS_QUESTIONS.map((text, index) => ({
//           text,
//           type: "MULTIPLE_CHOICE",
//           order: index + 1,
//           options: [
//             "Nunca",
//             "Raramente",
//             "Algunas veces",
//             "Frecuentemente",
//             "Muy frecuentemente"
//           ],
//         })),
//       },
//     },
//   });
// }

// const ASRS_QUESTIONS = [
//   '¿Con qué frecuencia tiene dificultad para terminar los detalles de un proyecto una vez que las partes más difíciles se han terminado?',
//   '¿Con qué frecuencia tiene dificultad para ordenar las cosas cuando tiene que hacer una tarea que requiere organización?',
//   '¿Con qué frecuencia tiene problemas para recordar citas u obligaciones?',
//   '¿Con qué frecuencia evita o pospone empezar tareas que requieren un esfuerzo mental considerable?',
//   '¿Con qué frecuencia pierde cosas necesarias para tareas o actividades (p. ej., llaves, documentos, gafas, móvil)?',
//   '¿Con qué frecuencia se distrae por la actividad o los ruidos a su alrededor?',
//   '¿Con qué frecuencia deja su asiento en reuniones u otras situaciones donde se espera que permanezca sentado?',
//   '¿Con qué frecuencia se siente inquieto o se retuerce en su asiento?',
//   '¿Con qué frecuencia se siente impulsado a hacer cosas, como si estuviera manejado por un motor?',
//   '¿Con qué frecuencia habla excesivamente en situaciones sociales?',
// ];

// main()
//   .then(() => prisma.$disconnect())
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
