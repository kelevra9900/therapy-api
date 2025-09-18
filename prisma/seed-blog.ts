import {PrismaClient,Role,PostStatus,CommentStatus} from '@prisma/client';
import * as dotenv from 'dotenv';
import {faker} from '@faker-js/faker';

dotenv.config();

const prisma = new PrismaClient({log: ['warn','error']});

async function upsertUser(params: {email: string; name: string; role: Role}) {
  const {email,name,role} = params;
  return prisma.user.upsert({
    where: {email},
    update: {name,role,isActive: true},
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

async function upsertCategory(name: string,slug: string,description?: string) {
  return prisma.category.upsert({
    where: {slug},
    update: {name,description},
    create: {name,slug,description},
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
    upsertCategory('Salud Mental','salud-mental','Noticias y psicoeducación basada en evidencia.'),
    upsertCategory('Psicoterapia','psicoterapia','Enfoques, técnicas y casos clínicos.'),
    upsertCategory('Mindfulness','mindfulness','Atención plena aplicada a terapia y autocuidado.'),
    upsertCategory('Herramientas para Terapeutas','herramientas-para-terapeutas','Recursos prácticos y plantillas.'),
  ]);

  const bySlug: Record<string,string> = Object.fromEntries(
    categories.map((c) => [c.slug,c.id])
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
      where: {slug},
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

  // await createPost({
  //   title: 'Checklist de primera entrevista clínica (plantilla imprimible)',
  //   slug: 'checklist-primera-entrevista-clinica',
  //   excerpt: 'Estructura mínima, banderas rojas y criterios de derivación.',
  //   content: '<p>Datos de identificación, motivo de consulta, antecedentes, examen mental...<\/p>',
  //   categorySlug: 'herramientas-para-terapeutas',
  //   authorId: admin.id,
  //   status: PostStatus.DRAFT,
  //   coverImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df',
  //   coverImageAlt: 'Portapapeles con checklist',
  // });

  // await createPost({
  //   title: 'Revisión breve: evidencia de TCC en trastornos de pánico',
  //   slug: 'tcc-trastorno-panico-evidencia',
  //   excerpt: 'Resumen de guías clínicas y metaanálisis recientes.',
  //   content: '<p>La TCC muestra tamaños de efecto robustos...<\/p>',
  //   categorySlug: 'psicoterapia',
  //   authorId: admin.id,
  //   status: PostStatus.ARCHIVED,
  // });

  // Post 5 — Plantillas de formularios clínicos
  await createPost({
    title: 'Plantillas de formularios clínicos: de la teoría al formulario usable',
    slug: 'plantillas-formularios-clinicos-usable',
    excerpt: 'Cómo modelar escalas y checklists (Impulsividad, ECP-28, GAD-7) para tu CMS y app.',
    content: `
    <h2>Por qué estructurar bien tus formularios</h2>
    <p>Un buen <em>layout</em> clínico reduce errores, acelera la captura y mejora la trazabilidad. Para conseguirlo, separa el <strong>esquema</strong> (JSON), la <strong>UI</strong> (componentes) y la <strong>lógica</strong> (validaciones y scoring).</p>

    <h3>Esquema mínimo recomendado</h3>
    <p>Ejemplo de un ítem tipo Likert (0–3) listo para renderizar:</p>
    <pre><code>{
  "id": "gad7_1",
  "label": "Sentirse nervioso, ansioso o al límite",
  "type": "likert",
  "options": [0,1,2,3],
  "required": true,
  "scoring": {"0":0,"1":1,"2":2,"3":3},
  "domain": "ansiedad"
}</code></pre>

    <h3>Buenas prácticas</h3>
    <ol>
      <li>Usa IDs estables y <strong>slugificados</strong> (sin espacios, en minúsculas).</li>
      <li>Versiona el formulario (<code>version</code>) para cambios futuros.</li>
      <li>Separa <code>displayHint</code> (texto para la UI) de <code>label</code> (enunciado clínico).</li>
      <li>Guarda respuestas en JSON, calcula <strong>score</strong> al cierre y persiste ambos.</li>
    </ol>

    <h3>Validación y scoring</h3>
    <p>Valida campos requeridos y rangos. Para el scoring, define reglas por escala: suma simple, inversión de reactivos, o puntos por umbral.</p>

    <blockquote><p>Tip: agrega <code>cutoffs</code> en el esquema para clasificar leve, moderado y severo sin tocar el código.</p></blockquote>

    <h3>Checklist imprimible</h3>
    <ul>
      <li>IDs únicos ✓</li>
      <li>Campos <code>required</code> donde aplique ✓</li>
      <li>Dominios clínicos etiquetados ✓</li>
      <li>Versión y metadatos ✓</li>
    </ul>
  `,
    categorySlug: 'herramientas-para-terapeutas',
    authorId: author.id,
    status: PostStatus.PUBLISHED,
    coverImage: 'https://images.unsplash.com/photo-1514517521153-1be72277b32e',
    coverImageAlt: 'Formulario clínico en portapapeles',
    isFeatured: false,
  });

  // Post 6 — Integración de resaltado de código en artículos (Highlight.js / Prism)
  await createPost({
    title: 'Cómo mostrar código bonito en tu blog: Highlight.js y Prism',
    slug: 'resaltado-codigo-highlight-prism',
    excerpt: 'Configura resaltado de sintaxis para snippets técnicos en artículos de tu CMS.',
    content: `
    <h2>Por qué necesitas resaltado</h2>
    <p>Si documentas esquemas JSON, DTOs o ejemplos de API, un resaltado básico mejora la lectura y reduce errores al copiar.</p>

    <h3>Opción A: Highlight.js</h3>
    <ol>
      <li>Incluye el script y el CSS del tema elegido.</li>
      <li>Envuelve el contenido en <code>&lt;pre&gt;&lt;code class="language-json"&gt;...&lt;/code&gt;&lt;/pre&gt;</code>.</li>
      <li>Inicializa con <code>hljs.highlightAll()</code>.</li>
    </ol>

    <pre><code>&lt;pre&gt;&lt;code class="language-json"&gt;{ "type": "likert", "options": [0,1,2,3] }&lt;/code&gt;&lt;/pre&gt;</code></pre>

    <h3>Opción B: Prism</h3>
    <p>Prism ofrece plugins útiles (copiar, línea activa). La mecánica es similar: clase <code>language-*</code> sobre <code>&lt;code&gt;</code>.</p>

    <h3>Accesibilidad</h3>
    <ul>
      <li>Contraste suficiente del tema.</li>
      <li>Etiqueta el lenguaje para lectores de pantalla.</li>
      <li>Evita bloques demasiado largos; prefiere fragmentos puntuales.</li>
    </ul>

    <blockquote><p>Pro tip: si renderizas desde Markdown, habilita el <em>remark/rehype</em> plugin para clases <code>language-*</code>.</p></blockquote>
  `,
    categorySlug: 'herramientas-para-terapeutas',
    authorId: author.id,
    status: PostStatus.PUBLISHED,
    coverImage: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
    coverImageAlt: 'Código en pantalla con resaltado',
    isFeatured: false,
  });

  // Post 7 — Demo de contenido enriquecido (usa tu bloque largo en HTML plano)
  await createPost({
    title: 'Demo de contenido enriquecido: tipografía, listas, imágenes y citas',
    slug: 'demo-contenido-enriquecido',
    excerpt: 'Ejemplo real de cómo se renderiza texto, listas, blockquotes, figuras y código.',
    content: `
    <p>
      Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iure vel officiis ipsum placeat itaque neque dolorem
      modi perspiciatis dolor distinctio veritatis sapiente, minima corrupti dolores necessitatibus suscipit
      accusantium dignissimos culpa cumque.
    </p>
    <p>
      It is a long established fact that a <strong>reader</strong> will be distracted by the readable content of a
      page when looking at its <strong>layout</strong>. The point of using Lorem Ipsum is that it has a more-or-less
      normal <a href="/#" target="_blank" rel="noopener noreferrer">distribution of letters.</a>
    </p>
    <ol>
      <li>We want everything to look good out of the box.</li>
      <li>Really just the first reason, that's the whole point of the plugin.</li>
      <li>Here's a third pretend reason though a list with three items looks more realistic than a list with two items.</li>
    </ol>
    <h3>Typography should be easy</h3>
    <p>So that's a header for you — with any luck if we've done our job correctly that will look pretty reasonable.</p>
    <p>Something a wise person once told me about typography is:</p>
    <blockquote>
      <p>Typography is pretty important if you don't want your stuff to look like trash. Make it good then it won't be bad.</p>
    </blockquote>
    <p>It's probably important that images look okay here by default as well:</p>
    <figure>
      <img
        src="https://images.pexels.com/photos/6802060/pexels-photo-6802060.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="nc blog"
        class="rounded-2xl object-cover"
        width="1260"
        height="750"
      />
      <figcaption>
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Iure vel officiis ipsum placeat itaque neque
        dolorem modi perspiciatis dolor distinctio veritatis sapiente
      </figcaption>
    </figure>
    <p>Now I'm going to show you an example of an unordered list to make sure that looks good, too:</p>
    <ul>
      <li>So here is the first item in this list.</li>
      <li>In this example we're keeping the items short.</li>
      <li>Later, we'll use longer, more complex list items.</li>
    </ul>
    <p>And that's the end of this section.</p>
    <h2>Code should look okay by default.</h2>
    <p>
      I think most people are going to use <a href="https://highlightjs.org/">highlight.js</a> or
      <a href="https://prismjs.com/">Prism</a>
      or something if they want to style their code blocks but it wouldn't hurt to make them look
      <em>okay</em> out of the box, even with no syntax highlighting.
    </p>
    <p>What I've written here is probably long enough, but adding this final sentence can't hurt.</p>
    <p>Hopefully that looks good enough to you.</p>
    <h3>We still need to think about stacked headings though.</h3>
    <h4>Let's make sure we don't screw that up with <code>h4</code> elements, either.</h4>
    <p>Phew, with any luck we have styled the headings above this text and they look pretty good.</p>
    <p>Let's add a closing paragraph here so things end with a decently sized block of text. I can't explain why I want things to end that way but I have to assume it's because I think things will look weird or unbalanced if there is a heading too close to the end of the document.</p>
    <p>What I've written here is probably long enough, but adding this final sentence can't hurt.</p>
  `,
    categorySlug: 'herramientas-para-terapeutas',
    authorId: author.id,
    status: PostStatus.PUBLISHED,
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
    coverImageAlt: 'Diseño editorial con tipografía',
    isFeatured: false,
  });

  // Comments for post1 (some approved, one pending)
  // const c1 = await prisma.comment.create({
  //   data: {
  //     postId: post1.id,
  //     content: 'Muy claro para explicar a pacientes en primera sesión. Gracias!',
  //     authorId: author.id,
  //     status: CommentStatus.APPROVED,
  //   },
  // });
  // await prisma.comment.create({
  //   data: {
  //     postId: post1.id,
  //     content: '¿Tienen alguna infografía descargable?',
  //     authorId: admin.id,
  //     status: CommentStatus.PENDING,
  //     parentId: c1.id,
  //   },
  // });

  // // Comments for post2
  // await prisma.comment.create({
  //   data: {
  //     postId: post2.id,
  //     content: 'Las microprácticas me ayudan a prevenir fatiga por compasión.',
  //     authorId: author.id,
  //     status: CommentStatus.APPROVED,
  //   },
  // });

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

