import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createPrismaMock } from './utils/mockPrisma';
import { startApp } from './utils/start-app';

describe('Memberships (e2e)', () => {
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

  afterEach(() => jest.clearAllMocks());
  afterAll(async () => app.close());

  it('GET /memberships returns list', async () => {
    prisma.membership.findMany!.mockResolvedValue([
      { id: 'm1', name: 'Basic', description: 'Basic plan', stripePriceId: 'price_1', priceMonthly: 9, priceYearly: 90, features: [], createdAt: new Date() },
      { id: 'm2', name: 'Pro', description: 'Pro plan', stripePriceId: 'price_2', priceMonthly: 19, priceYearly: 190, features: [], createdAt: new Date() },
    ]);

    const res = await request(app.getHttpServer()).get('/memberships').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(prisma.membership.findMany).toHaveBeenCalled();
  });
});
