import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, SubscriptionStatus } from 'generated/prisma';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;
}
