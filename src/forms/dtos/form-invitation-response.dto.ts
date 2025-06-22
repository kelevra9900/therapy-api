import { ApiProperty } from '@nestjs/swagger';

export class FormInvitationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  token: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  formTemplateId: string;

  @ApiProperty()
  formTitle: string;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ nullable: true })
  expiresAt: string | null;
}
