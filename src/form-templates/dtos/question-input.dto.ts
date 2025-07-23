import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import {QuestionType} from 'generated/prisma';

export class QuestionInputDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  text: string;

  @IsEnum(QuestionType)
  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @IsObject()
  @IsOptional()
  @ApiProperty({ required: false, description: 'Used for options in multiple choice or scale questions' })
  options?: Record<string, any>;

  @IsInt()
  @ApiProperty()
  order: number;
}
