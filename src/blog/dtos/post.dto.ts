import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
  @ApiProperty({ example: 'Cómo manejar la ansiedad' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'como-manejar-la-ansiedad' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ example: 'Guía práctica para manejar la ansiedad.' })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ example: '<p>Contenido del post</p>' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'Persona meditando' })
  @IsOptional()
  @IsString()
  coverImageAlt?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: 'uuid-categoria', description: 'ID de categoría' })
  @IsString()
  categoryId: string;
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

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 'uuid-categoria', description: 'ID de categoría' })
  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdatePostStatusDto {
  @ApiProperty({ enum: PostStatus, example: PostStatus.PUBLISHED })
  status: PostStatus;
}

