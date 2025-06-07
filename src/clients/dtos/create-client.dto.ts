import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateClientDto {
  @ApiProperty({ example: 'Carlos López' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'carlos@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '1990-10-05' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'Paciente con historial de ansiedad' })
  @IsOptional()
  @IsString()
  notes?: string;
}
