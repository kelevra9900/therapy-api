import { Injectable } from '@nestjs/common';

import {PrismaService} from '../prisma/prisma.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  constructor(
    private readonly prismaService: PrismaService
    ) {
  }

  findOne(username: string): User | undefined {
    return this.users.find((user) => user.username === username);
  }
}
