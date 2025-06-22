import { IsNotEmpty, IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFormResponseDto {
  @ApiProperty({
    example: {
      'question-id-1': 'Respuesta 1',
      'question-id-2': 'Respuesta 2',
    },
    description: 'Respuestas del formulario, clave por ID de pregunta',
  })
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string>;
}
