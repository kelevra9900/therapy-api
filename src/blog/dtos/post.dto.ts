import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import type { PostStatus } from '@prisma/client';

// Utilidad segura para booleans en multipart/form-data
const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', '1', 'on', 'yes'].includes(v)) return true;
    if (['false', '0', 'off', 'no'].includes(v)) return false;
  }
  return undefined; // deja que el validador marque error si viene algo inválido
};

export class CreatePostDto {
  @ApiProperty({ example: 'Cómo manejar la ansiedad' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'como-manejar-la-ansiedad' })
  @IsString()
  slug!: string;

  @ApiPropertyOptional({ example: 'Guía práctica para manejar la ansiedad.' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: '<p>Contenido del post</p>' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'Persona meditando' })
  @IsOptional()
  @IsString()
  coverImageAlt?: string;

  // Swagger: archivo binario; en runtime lo recibes con FileInterceptor
  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Archivo de imagen de portada' })
  @IsOptional()
  // No le pongas validadores aquí; solo lo tipamos para TS:
  coverImageFile?: Express.Multer.File;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isFeatured?: boolean;

  @ApiProperty({ example: '0d0c0145-cf42-4361-9c5c-4fb66feb4513', description: 'ID de categoría' })
  @IsUUID()
  categoryId!: string;
}

export class UpdatePostDto {
  @ApiPropertyOptional({ example: 'Cómo manejar la ansiedad' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'como-manejar-la-ansiedad' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ example: 'Guía práctica para manejar la ansiedad.' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional({ example: '<p>Contenido del post</p>' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'Persona meditando' })
  @IsOptional()
  @IsString()
  coverImageAlt?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary', description: 'Archivo de imagen de portada' })
  @IsOptional()
  coverImageFile?: Express.Multer.File;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: '0d0c0145-cf42-4361-9c5c-4fb66feb4513', description: 'ID de categoría' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class UpdatePostStatusDto {
  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  status!: PostStatus;
}
