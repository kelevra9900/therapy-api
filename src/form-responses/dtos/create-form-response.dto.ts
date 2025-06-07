import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFormResponseDto {
  @ApiProperty({ description: 'ID del formulario que se enviará', example: 'form-uuid' })
  @IsUUID()
  formTemplateId: string;

  @ApiProperty({ description: 'ID del paciente al que se le envía', example: 'client-uuid' })
  @IsUUID()
  clientId: string;
}
