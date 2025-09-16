import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CommentStatus } from '@prisma/client';

export class CreateCommentDto {
  @ApiProperty({ example: 'Excelente artículo, gracias por compartir.' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ example: 'uuid-comentario-padre', description: 'Para respuestas en hilo' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateCommentStatusDto {
  @ApiProperty({ enum: CommentStatus, example: CommentStatus.APPROVED })
  status: CommentStatus;
}

