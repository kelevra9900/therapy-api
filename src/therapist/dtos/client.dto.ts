import { ApiProperty } from '@nestjs/swagger';
import {IsOptional} from 'class-validator';

export class ClientDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'Juan Pérez' })
  name: string;

  @ApiProperty({ example: 'juan.perez@example.com' })
  email: string;

  @ApiProperty({ example: 'Depresión' })
  notes: string;
  
  @ApiProperty({ example: 'Male' })
  gender: string;

  @ApiProperty({ example: 'ISO' })
  @IsOptional()
  birthday: Date | null

  @ApiProperty({ example: 'ISO' })
  @IsOptional()
  created_at: Date | null
}
