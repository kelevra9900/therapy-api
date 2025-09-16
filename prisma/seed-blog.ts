import { PrismaClient, Role, PostStatus, CommentStatus } from '@prisma/client';
import * as dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

dotenv.config();

const prisma = new PrismaClient({ log: ['warn', 'error'] });

async function upsertUser(params: { email: string; name: string; role: Role }) {
  const { email, name, role } = params;
  return prisma.user.upsert({
    where: { email },
    update: { name, role, isActive: true },
    create: {
      email,
      name,
      passwordHash: 'hashed_password',
      role,
      isActive: true,
      subscriptionStatus: 'ACTIVE',
    },
  });
}

async function upsertCategory(name: string, slug: string, description?: string) {
  return prisma.category.upsert({
    where: { slug },
    update: { name, description },
    create: { name, slug, description },
  });
}

async function main() {
  console.log('📝 Seeding blog data for therapists...');

  // Ensure baseline users
  const admin = await upsertUser({
    email: 'admin@therapy.local',
    name: 'Admin',
    role: Role.ADMIN,
  });

  const author = await upsertUser({
    email: 'autor@therapy.local',
    name: 'Terapeuta Autor',
    role: Role.THERAPIST,
  });

  // Categories focused on therapists
  const categories = await Promise.all([
    upsertCategory('Salud Mental', 'salud-mental', 'Noticias y psicoeducación basada en evidencia.'),
    upsertCategory('Psicoterapia', 'psicoterapia', 'Enfoques, técnicas y casos clínicos.'),
    upsertCategory('Mindfulness', 'mindfulness', 'Atención plena aplicada a terapia y autocuidado.'),
    upsertCategory('Herramientas para Terapeutas', 'herramientas-para-terapeutas', 'Recursos prácticos y plantillas.'),
  ]);

  const bySlug: Record<string, string> = Object.fromEntries(
    categories.map((c) => [c.slug, c.id])
  );

  // Helper to create post with defaults
  async function createPost(args: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    categorySlug: string;
    authorId: string;
    status?: PostStatus;
    coverImage?: string;
    coverImageAlt?: string;
    isFeatured?: boolean;
  }) {
    const {
      title,
      slug,
      excerpt,
      content,
      categorySlug,
      authorId,
      status = PostStatus.DRAFT,
      coverImage,
      coverImageAlt,
      isFeatured,
    } = args;

    return prisma.blogPost.upsert({
      where: { slug },
      update: {
        title,
        excerpt,
        content,
        coverImage,
        coverImageAlt,
        isFeatured: !!isFeatured,
        status,
        categoryId: bySlug[categorySlug],
        authorId,
        publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
      },
      create: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        coverImageAlt,
        isFeatured: !!isFeatured,
        status,
        categoryId: bySlug[categorySlug],
        authorId,
        publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
      },
    });
  }

  // Seed posts
  const post1 = await createPost({
    title: 'Psicoeducación sobre ansiedad para pacientes: guía breve para consulta',
    slug: 'psicoeducacion-ansiedad-guia-breve',
    excerpt: 'Puntos clave para explicar la ansiedad de forma simple y con base científica.',
    content:
      '<h2>Qué es la ansiedad</h2><p>La ansiedad es una respuesta normal...<\/p>' +
      '<h2>Modelo cognitivo</h2><p>Identificar pensamientos automáticos...<\/p>' +
      '<h2>Estrategias</h2><ul><li>Respiración diafragmática</li><li>Exposición gradual</li></ul>',
    categorySlug: 'salud-mental',
    authorId: author.id,
    status: PostStatus.PUBLISHED,
    coverImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61',
    coverImageAlt: 'Paciente en consulta con terapeuta',
    isFeatured: true,
  });

  const post2 = await createPost({
    title: 'Mindfulness para terapeutas: microprácticas entre sesiones',
    slug: 'mindfulness-para-terapeutas-micropracticas',
    excerpt: 'Rutinas breves para regularte antes y después de sesiones clínicas.',
    content:
      '<p>3 respiraciones conscientes, escaneo corporal de 60s y etiquetado emocional...<\/p>',
    categorySlug: 'mindfulness',
    authorId: author.id,
    status: PostStatus.PUBLISHED,
    coverImage: 'https://images.unsplash.com/photo-1519183071298-a2962be96f83',
    coverImageAlt: 'Terapeuta meditando',
  });

  const post3 = await createPost({
    title: 'Checklist de primera entrevista clínica (plantilla imprimible)',
    slug: 'checklist-primera-entrevista-clinica',
    excerpt: 'Estructura mínima, banderas rojas y criterios de derivación.',
    content: '<p>Datos de identificación, motivo de consulta, antecedentes, examen mental...<\/p>',
    categorySlug: 'herramientas-para-terapeutas',
    authorId: admin.id,
    status: PostStatus.DRAFT,
    coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df',
    coverImageAlt: 'Portapapeles con checklist',
  });

  const post4 = await createPost({
    title: 'Revisión breve: evidencia de TCC en trastornos de pánico',
    slug: 'tcc-trastorno-panico-evidencia',
    excerpt: 'Resumen de guías clínicas y metaanálisis recientes.',
    content: '<p>La TCC muestra tamaños de efecto robustos...<\/p>',
    categorySlug: 'psicoterapia',
    authorId: admin.id,
    status: PostStatus.ARCHIVED,
  });

  // Comments for post1 (some approved, one pending)
  const c1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      content: 'Muy claro para explicar a pacientes en primera sesión. Gracias!',
      authorId: author.id,
      status: CommentStatus.APPROVED,
    },
  });
  await prisma.comment.create({
    data: {
      postId: post1.id,
      content: '¿Tienen alguna infografía descargable?',
      authorId: admin.id,
      status: CommentStatus.PENDING,
      parentId: c1.id,
    },
  });

  // Comments for post2
  await prisma.comment.create({
    data: {
      postId: post2.id,
      content: 'Las microprácticas me ayudan a prevenir fatiga por compasión.',
      authorId: author.id,
      status: CommentStatus.APPROVED,
    },
  });

  console.log('✅ Blog seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

