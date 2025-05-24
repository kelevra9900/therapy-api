import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryOptionsDto {
  @ApiPropertyOptional({ example: 1, description: 'Página actual' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Elementos por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'john', description: 'Término de búsqueda' })
  @IsOptional()
  @IsString()
  search?: string;
}
