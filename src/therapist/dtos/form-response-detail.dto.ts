import { ApiProperty } from '@nestjs/swagger';
import { AnxietyLevel, QuestionType } from 'generated/prisma';

export class AnswerDto {
  @ApiProperty()
  questionId: string;

  @ApiProperty()
  questionText: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty()
  answer: string;
}

export class FormResponseDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filledAt: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  clientEmail: string;

  @ApiProperty()
  formTemplateTitle: string;

  @ApiProperty({ type: [AnswerDto] })
  responses: AnswerDto[];

  @ApiProperty({ required: false })
  score?: number;

  @ApiProperty({ enum: AnxietyLevel, required: false })
  level?: AnxietyLevel;
}
