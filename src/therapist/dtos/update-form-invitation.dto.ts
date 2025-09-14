import { IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';


export class UpdateFormInvitationDto {
  @ApiPropertyOptional({
    description:
      'Fecha de expiración en formato ISO 8601. Omite el campo para eliminar la expiración.',
    example: '2025-12-31T23:59:59.000Z',
    format: 'date-time',
    nullable: true,
  })
  @IsDateString()
  expiresAt?: string;
}
