// src/modules/form-templates/dtos/update-form-template.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionInputDto } from './question-input.dto';

export class UpdateFormTemplateDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  isActive?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionInputDto)
  @IsOptional()
  @ApiProperty({ type: [QuestionInputDto], required: false })
  questions?: QuestionInputDto[];
}
