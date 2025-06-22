import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '@prisma/client';

export class QuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ enum: QuestionType })
  type: QuestionType;

  @ApiProperty({
    description: 'Possible options (JSON), applicable for multiple_choice or scale types',
    example: ['Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre'],
  })
  options: any;

  @ApiProperty({ example: 1 })
  order: number;
}
