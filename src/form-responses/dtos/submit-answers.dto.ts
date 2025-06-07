import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerInputDto {
  @ApiProperty({ example: 'question-uuid' })
  @IsUUID()
  questionId: string;

  @ApiProperty({ example: '2' })
  @IsString()
  answer: string;
}

export class SubmitAnswersDto {
  @ApiProperty({ type: [AnswerInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerInputDto)
  answers: AnswerInputDto[];
}
