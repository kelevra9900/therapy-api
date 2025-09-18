import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createPrismaMock } from './utils/mockPrisma';
import { startApp } from './utils/start-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const prisma = createPrismaMock();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await startApp(app);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register creates a user', async () => {
    prisma.user.create!.mockResolvedValue({
      id: 'u-1',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash: 'hashed',
      role: 'THERAPIST',
      isActive: true,
      subscriptionStatus: 'INACTIVE',
      createdAt: new Date(),
      avatar: null,
    });

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'John Doe', email: 'john@example.com', password: 'passw0rd!' })
      .expect(201);

    expect(res.body).toMatchObject({
      id: 'u-1',
      email: 'john@example.com',
      name: 'John Doe',
      role: 'THERAPIST',
    });
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('POST /auth/login returns access_token', async () => {
    const password = 'P@ssw0rd!';
    const passwordHash = await bcrypt.hash(password, 10);
    prisma.user.findUnique!.mockResolvedValue({
      id: 'u-2',
      email: 'login@example.com',
      name: 'Login User',
      passwordHash,
      role: 'THERAPIST',
      subscriptionStatus: 'ACTIVE',
      createdAt: new Date(),
    });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'login@example.com', password })
      .expect(200);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body.user).toMatchObject({ id: 'u-2', email: 'login@example.com' });
  });
});
