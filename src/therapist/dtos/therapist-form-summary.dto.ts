import { ApiProperty } from '@nestjs/swagger';

export class FormResponseSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  filledAt: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  clientEmail: string;

  @ApiProperty()
  formTemplateTitle: string;
}
