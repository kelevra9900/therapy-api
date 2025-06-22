import { ApiProperty } from '@nestjs/swagger';
import { TherapistClientDto } from './therapist-client.dto';

class ResponseAnswerDto {
  @ApiProperty({ example: '¿Te sientes nervioso o ansioso?' })
  questionText: string;

  @ApiProperty({ example: 'Sí' })
  answer: string;

  @ApiProperty({ example: 'MULTIPLE_CHOICE' })
  type: string;
}

export class TherapistFormResponseDto {
  @ApiProperty({ example: 'f82c50a6-3e94-4c1b-8b27-b15db6fdff31' })
  id: string;

  @ApiProperty()
  client: TherapistClientDto;

  @ApiProperty({ example: 'Formulario de Ansiedad GAD-7' })
  title: string;

  @ApiProperty({ example: '2025-06-08T19:42:29.248Z' })
  filledAt: string;

  @ApiProperty({ type: [ResponseAnswerDto] })
  responses: ResponseAnswerDto[];

  @ApiProperty({ example: 4, required: false })
  score?: number;

  @ApiProperty({ example: 'MODERATE', required: false })
  level?: string;
}
