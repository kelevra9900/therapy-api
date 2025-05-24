import { Role, SubscriptionStatus } from '@prisma/client';

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
}
