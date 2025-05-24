import {ApiProperty} from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCheckoutSessionDto { 
  @ApiProperty({
    description: 'Price ID from Stripe',
    example: 'price_1Hh1Y2L4g3f3f3f3f3f3f3f3',
    required: true,
  })
  @IsString()
  priceId: string;
}