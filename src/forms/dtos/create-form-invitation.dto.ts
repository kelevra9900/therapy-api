import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateFormInvitationDto {
  @ApiProperty({
    description: 'ID del cliente al que se le enviará el formulario',
    example: '1d9a4e20-dc3c-4df2-ae0e-83e4e8430d2f',
  })
  @IsUUID()
  clientId: string;

  @ApiProperty({
    description: 'ID del formulario que se desea enviar',
    example: '2a3f72c1-4a41-466b-a8cb-e78e3221c411',
  })
  @IsUUID()
  formTemplateId: string;

  @ApiProperty({
    description: 'Fecha de expiración del link (opcional)',
    example: '2025-07-01T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
