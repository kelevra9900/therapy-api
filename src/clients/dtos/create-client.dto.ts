import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';
import {Gender} from 'generated/prisma';

export class CreateClientDto {
  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del cliente',
    example: 'juan.perez@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del cliente',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Debe ser una fecha válida (YYYY-MM-DD)' })
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Género del cliente',
    enum: Gender,
    example: Gender.MALE,
  })
  @IsOptional()
  @IsEnum(Gender, { message: 'Género no válido' })
  gender?: Gender;

  @ApiPropertyOptional({
    description: 'Notas adicionales sobre el cliente',
    example: 'Cliente con antecedentes de ansiedad',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
