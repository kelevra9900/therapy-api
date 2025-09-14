import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type FormDef = {
  title: string;
  description: string;
  questions: { text: string; type: 'MULTIPLE_CHOICE' | 'SCALE' | 'TEXT' | 'BOOLEAN'; order: number; options?: any }[];
};

const CREATED_BY = process.env.SEED_CREATED_BY_USER_ID || 'seed-admin';

const forms: FormDef[] = [
  {
    title: 'GAD-7 – Anxiety',
    description: 'Over the last two weeks, how often have you been bothered by the following problems?',
    questions: [
      { text: 'Feeling nervous, anxious, or on edge.', type: 'MULTIPLE_CHOICE', order: 1, options: ['0 = Not at all', '1 = Several days', '2 = More than half the days', '3 = Nearly every day'] },
      { text: 'Not being able to stop or control worrying.', type: 'MULTIPLE_CHOICE', order: 2, options: ['0 = Not at all', '1 = Several days', '2 = More than half the days', '3 = Nearly every day'] },
      { text: 'Worrying too much about different things.', type: 'MULTIPLE_CHOICE', order: 3, options: ['0 = Not at all', '1 = Several days', '2 = More than half the days', '3 = Nearly every day'] },
      { text: 'Trouble relaxing.', type: 'MULTIPLE_CHOICE', order: 4, options: ['0 = Not at all', '1 = Several days', '2 = More than half the days', '3 = Nearly every day'] },
      { text: 'Being so restless that it is hard to sit still.', type: 'MULTIPLE_CHOICE', order: 5, options: ['0 = Not at all', '1 = Several days', '2 = More than half the days', '3 = Nearly every day'] },
      { text: 'Becoming easily annoyed or irritable.', type: 'MULTIPLE_CHOICE', order: 6, options: ['0 = Not at all', '1 = Several days', '2 = More than half the days', '3 = Nearly every day'] },
      { text: 'Feeling afraid as if something awful might happen.', type: 'MULTIPLE_CHOICE', order: 7, options: ['0 = Not at all', '1 = Several days', '2 = More than half the days', '3 = Nearly every day'] },
    ],
  },
  {
    title: 'PHQ-9 – Depression',
    description: 'Over the last two weeks, how often have you been bothered by any of the following problems?',
    questions: Array.from({ length: 9 }).map((_, i) => ({
      text: `PHQ-9 item ${i + 1}`,
      type: 'MULTIPLE_CHOICE' as const,
      order: i + 1,
      options: ['0 = Not at all', '1 = Several days', '2 = More than half the days', '3 = Nearly every day'],
    })),
  },
  {
    title: 'AUDIT – Alcohol Use Disorders Identification Test',
    description: 'Screens for hazardous and harmful alcohol consumption over the past 12 months. Total score 0–40.',
    questions: [
      { text: 'How often do you have a drink containing alcohol?', order: 1, type: 'MULTIPLE_CHOICE', options: ['Never (0)', 'Monthly or less (1)', '2–4 times a month (2)', '2–3 times a week (3)', '4+ times a week (4)'] },
      { text: 'How many drinks do you have on a typical day when you are drinking?', order: 2, type: 'MULTIPLE_CHOICE', options: ['1–2 (0)', '3–4 (1)', '5–6 (2)', '7–9 (3)', '10+ (4)'] },
      { text: 'How often do you have six or more drinks on one occasion?', order: 3, type: 'MULTIPLE_CHOICE', options: ['Never (0)', 'Less than monthly (1)', 'Monthly (2)', 'Weekly (3)', 'Daily or almost daily (4)'] },
      { text: 'How often during the last year have you found that you were not able to stop drinking once you had started?', order: 4, type: 'MULTIPLE_CHOICE', options: ['Never (0)', 'Less than monthly (1)', 'Monthly (2)', 'Weekly (3)', 'Daily or almost daily (4)'] },
      { text: 'How often during the last year have you failed to do what was normally expected from you because of drinking?', order: 5, type: 'MULTIPLE_CHOICE', options: ['Never (0)', 'Less than monthly (1)', 'Monthly (2)', 'Weekly (3)', 'Daily or almost daily (4)'] },
      { text: 'How often during the last year have you needed a first drink in the morning to get yourself going after a heavy drinking session?', order: 6, type: 'MULTIPLE_CHOICE', options: ['Never (0)', 'Less than monthly (1)', 'Monthly (2)', 'Weekly (3)', 'Daily or almost daily (4)'] },
      { text: 'How often during the last year have you had a feeling of guilt or remorse after drinking?', order: 7, type: 'MULTIPLE_CHOICE', options: ['Never (0)', 'Less than monthly (1)', 'Monthly (2)', 'Weekly (3)', 'Daily or almost daily (4)'] },
      { text: 'How often during the last year have you been unable to remember what happened the night before because of your drinking?', order: 8, type: 'MULTIPLE_CHOICE', options: ['Never (0)', 'Less than monthly (1)', 'Monthly (2)', 'Weekly (3)', 'Daily or almost daily (4)'] },
      { text: 'Have you or someone else been injured as a result of your drinking?', order: 9, type: 'MULTIPLE_CHOICE', options: ['No (0)', 'Yes, but not in the last year (2)', 'Yes, during the last year (4)'] },
      { text: 'Has a relative, friend, or a doctor or another health worker been concerned about your drinking or suggested you cut down?', order: 10, type: 'MULTIPLE_CHOICE', options: ['No (0)', 'Yes, but not in the last year (2)', 'Yes, during the last year (4)'] },
    ],
  },
  {
    title: 'CAGE-AID – Substance Use Screening',
    description: 'Brief 4-item screen for alcohol and drug use. 2+ “Yes” suggests possible problem use.',
    questions: [
      { text: 'Have you ever felt you should Cut down on your drinking or drug use?', order: 1, type: 'MULTIPLE_CHOICE', options: ['Yes', 'No'] },
      { text: 'Have people Annoyed you by criticizing your drinking or drug use?', order: 2, type: 'MULTIPLE_CHOICE', options: ['Yes', 'No'] },
      { text: 'Have you ever felt bad or Guilty about your drinking or drug use?', order: 3, type: 'MULTIPLE_CHOICE', options: ['Yes', 'No'] },
      { text: 'Have you ever had a drink or used drugs first thing in the morning to steady your nerves or get rid of a hangover (Eye-opener)?', order: 4, type: 'MULTIPLE_CHOICE', options: ['Yes', 'No'] },
    ],
  },
  {
    title: 'BIS-11 short – Impulsiveness',
    description: 'Short version of the Barratt Impulsiveness Scale (example items).',
    questions: [
      { text: 'I act on the spur of the moment.', order: 1, type: 'MULTIPLE_CHOICE', options: ['1 = Never', '2 = Rarely', '3 = Sometimes', '4 = Often', '5 = Always'] },
      { text: 'I do things without thinking.', order: 2, type: 'MULTIPLE_CHOICE', options: ['1 = Never', '2 = Rarely', '3 = Sometimes', '4 = Often', '5 = Always'] },
      { text: 'I am restless at lectures or talks.', order: 3, type: 'MULTIPLE_CHOICE', options: ['1 = Never', '2 = Rarely', '3 = Sometimes', '4 = Often', '5 = Always'] },
      { text: 'I plan for job security.', order: 4, type: 'MULTIPLE_CHOICE', options: ['1 = Never', '2 = Rarely', '3 = Sometimes', '4 = Often', '5 = Always'] },
      { text: 'I like to think about complex problems.', order: 5, type: 'MULTIPLE_CHOICE', options: ['1 = Never', '2 = Rarely', '3 = Sometimes', '4 = Often', '5 = Always'] },
    ],
  },
];

async function upsertFormTemplate(def: FormDef) {
  const existing = await prisma.formTemplate.findFirst({
    where: { title: { equals: def.title, mode: 'insensitive' } },
  });
  if (existing) {
    return { skipped: true, id: existing.id };
  }
  const created = await prisma.formTemplate.create({
    data: {
      title: def.title,
      description: def.description,
      isActive: true,
      createdBy: CREATED_BY,
      questions: { create: def.questions.map((q) => ({ text: q.text, type: q.type, order: q.order, options: q.options ?? null })) },
    },
  });
  return { skipped: false, id: created.id };
}

async function main() {
  console.log('🌱 Seeding form templates...');
  for (const def of forms) {
    const res = await upsertFormTemplate(def);
    console.log(`${res.skipped ? '↩️  Skipped' : '✅ Created'}: ${def.title} (${res.id})`);
  }
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

