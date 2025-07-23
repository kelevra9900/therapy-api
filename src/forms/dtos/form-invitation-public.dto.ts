import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from 'generated/prisma';

export class FormInvitationQuestionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty({
    type: Object,
    description: 'Options for the question (if applicable)',
  })
  options: Record<string, any>;

  @ApiProperty()
  order: number;
}

export class FormInvitationPublicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  formTemplate: {
    id: string;
    title: string;
    description: string;
    questions: FormInvitationQuestionDto[];
  };
}
