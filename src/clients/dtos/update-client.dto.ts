import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import {Gender} from 'generated/prisma';

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'Laura Hernández' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'laura@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '1990-10-05' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: 'Notas actualizadas del paciente' })
  @IsOptional()
  @IsString()
  notes?: string;
}
