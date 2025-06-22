import { ApiProperty } from '@nestjs/swagger';

export class FormTemplateResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Inventario de Ira Estado-Rasgo (STAXI-2)' })
  title: string;

  @ApiProperty({
    example: 'Versión abreviada del STAXI-2 para evaluar el estado de ira',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  createdBy: string;

  @ApiProperty({ example: '2025-06-08 19:00:00' })
  createdAt: string;
}
