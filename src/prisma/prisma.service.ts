
import { Injectable, OnModuleInit } from '@nestjs/common';
import {PrismaClient} from '@prisma/client';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

  constructor() {
    super({
      log: ['query', 'info', 'warn'],
    });
  }


  /**
   * This method is called when the module is initialized.
   * It connects to the database using Prisma Client.
   */
  async onModuleInit() {
    await this.$connect();
  }


  /**
   * This method is called when the module is destroyed.
   * It disconnects from the database using Prisma Client.
   */
  async onModuleDestroy() {
    await this.$disconnect(); 
  }


  /**
   * This method is called when an error occurs.
   * It handles the error and disconnects from the database using Prisma Client.
   * @param error - The error that occurred.
   */
  async onModuleError(error: Error) {
    console.error('Prisma Client error:', error);
    await this.$disconnect();
  }
}
