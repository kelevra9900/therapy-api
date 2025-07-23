import { ApiProperty } from '@nestjs/swagger';
import { QuestionType, AnxietyLevel } from '@prisma/client';

export class ResponseDto {
  @ApiProperty()
  questionId: string;

  @ApiProperty()
  questionText: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty()
  answer: string;
}

export class FormTemplateSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
}

export class ClientSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  email?: string;
}

export class FormInvitationWithResponsesDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filledAt: Date;

  @ApiProperty({ type: ClientSummaryDto })
  client: ClientSummaryDto;

  @ApiProperty({ type: FormTemplateSummaryDto })
  formTemplate: FormTemplateSummaryDto;

  @ApiProperty({ type: [ResponseDto] })
  responses: ResponseDto[];

  @ApiProperty({ required: false })
  score?: number;

  @ApiProperty({ enum: AnxietyLevel, required: false })
  level?: AnxietyLevel;
}
