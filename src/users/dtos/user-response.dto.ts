// dtos/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role, SubscriptionStatus } from 'generated/prisma';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ enum: SubscriptionStatus })
  subscriptionStatus: SubscriptionStatus;

  @ApiProperty()
  createdAt: string;
}
