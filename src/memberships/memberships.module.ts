import { Module } from '@nestjs/common';
import { MembershipsController } from './memberships.controller';
import { SharedModule } from '@/common/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [MembershipsController],
})
export class MembershipsModule {}
