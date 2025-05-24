import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDirectSubscriptionDto {
  @ApiProperty({ example: 'pm_1OMXfPL3XXXXXX', description: 'Payment Method ID' })
  @IsString()
  paymentMethodId: string;

  @ApiProperty({ example: 'price_1OM6J0L3XXXXXX', description: 'Stripe Price ID' })
  @IsString()
  priceId: string;
}
