export type DeepMock<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any
    ? jest.Mock<ReturnType<T[K]>, Parameters<T[K]>>
    : T[K] extends object
    ? DeepMock<T[K]>
    : T[K];
};

export function createPrismaMock() {
  const mock: any = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    membership: {
      findMany: jest.fn(),
    },
    passwordResetToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  return mock as DeepMock<any>;
}

