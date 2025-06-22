// src/modules/form-templates/dtos/create-form-template.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionInputDto } from './question-input.dto';

export class CreateFormTemplateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string;

  @IsBoolean()
  @ApiProperty()
  isActive: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionInputDto)
  @ApiProperty({ type: [QuestionInputDto] })
  questions: QuestionInputDto[];
}
