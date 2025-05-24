import { Module } from '@nestjs/common'; // opcional
import { SharedModule } from '@/common/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [], // si tienes uno
})
export class PaymentsModule {}
