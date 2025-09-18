import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { MediaService } from '../src/media/media.service';
import { createPrismaMock } from './utils/mockPrisma';
import { startApp } from './utils/start-app';

const fakeMedia = {
  persistFile: jest.fn().mockResolvedValue('/uploads/blog/fake-cover.jpg'),
  removeFile: jest.fn().mockResolvedValue(undefined),
};

describe('Blog Posts (e2e)', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const prisma = createPrismaMock();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(MediaService)
      .useValue(fakeMedia)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await startApp(app);
    jwt = app.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /blog/posts creates a post with uploaded cover image', async () => {
    const userId = 'author-123';
    const token = jwt.sign({ sub: userId, email: 'therapist@example.com', role: 'THERAPIST', name: 'Therapist' });

    prisma.blogPost.create!.mockResolvedValue({
      id: 'post-123',
      title: 'New Post',
      slug: 'new-post',
      excerpt: 'Short excerpt',
      content: '<p>Content</p>',
      coverImage: '/uploads/blog/fake-cover.jpg',
      coverImageAlt: 'Alt text',
      isFeatured: false,
      status: 'DRAFT',
      authorId: userId,
      categoryId: 'category-1',
      category: { id: 'category-1', name: 'Category' },
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: null,
    });

    const response = await request(app.getHttpServer())
      .post('/blog/posts')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'New Post')
      .field('slug', 'new-post')
      .field('excerpt', 'Short excerpt')
      .field('content', '<p>Content</p>')
      .field('coverImageAlt', 'Alt text')
      .field('categoryId', 'category-1')
      .attach('coverImageFile', Buffer.from('fake image content'), {
        filename: 'cover.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      title: 'New Post',
      slug: 'new-post',
      coverImage: '/uploads/blog/fake-cover.jpg',
    });

    expect(prisma.blogPost.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        title: 'New Post',
        slug: 'new-post',
        coverImage: '/uploads/blog/fake-cover.jpg',
        authorId: userId,
      }),
      include: { category: true },
    });
    expect(fakeMedia.persistFile).toHaveBeenCalledTimes(1);
  });
});
