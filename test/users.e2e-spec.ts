import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { JwtService } from '@nestjs/jwt';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createPrismaMock } from './utils/mockPrisma';
import { startApp } from './utils/start-app';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let jwt: JwtService;
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
    jwt = app.get(JwtService);
  });

  afterEach(() => jest.clearAllMocks());
  afterAll(async () => app.close());

  it('GET /users/me returns current user when authorized', async () => {
    const userId = 'user-123';
    const token = jwt.sign({ sub: userId, email: 'me@example.com', role: 'THERAPIST', name: 'Me' });

    prisma.user.findUnique!.mockResolvedValue({
      id: userId,
      avatar: null,
      name: 'Me',
      email: 'me@example.com',
      role: 'THERAPIST',
      isActive: true,
      subscriptionStatus: 'ACTIVE',
      createdAt: new Date(),
    });

    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toMatchObject({ id: userId, email: 'me@example.com', name: 'Me' });
    expect(prisma.user.findUnique).toHaveBeenCalled();
  });
});
