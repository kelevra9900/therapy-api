import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Psicología', description: 'Nombre de la categoría' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'psicologia', description: 'Slug único' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Contenido sobre psicología' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Psicología' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'psicologia' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Contenido sobre psicología' })
  @IsOptional()
  @IsString()
  description?: string;
}

