// therapist/dto/therapist-client.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TherapistClientDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  email: string;
}
