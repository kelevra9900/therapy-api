import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnxietyLevel, Gender } from '@prisma/client';

export class DashboardClientDto {
  @ApiProperty({ example: 'cli_1' })
  id!: string;

  @ApiProperty({ example: 'Laura Méndez' })
  name!: string;

  @ApiPropertyOptional({ example: 'laura.mendez@gmail.com', nullable: true })
  email?: string | null;

  @ApiPropertyOptional({ enum: Gender, nullable: true })
  gender?: Gender | null;
}

export class DashboardFormTemplateDto {
  @ApiProperty({ example: 'form_1' })
  id!: string;

  @ApiProperty({ example: 'Escala de ansiedad GAD-7' })
  title!: string;
}

export class DashboardFormResponseDto {
  @ApiProperty({ example: 'res_1' })
  id!: string;

  @ApiProperty({ example: '2025-07-25T14:32:00.000Z', format: 'date-time' })
  filledAt!: string;

  @ApiPropertyOptional({ enum: AnxietyLevel, nullable: true })
  level?: AnxietyLevel | null;

  @ApiProperty({ type: DashboardClientDto })
  client!: DashboardClientDto;

  @ApiProperty({ type: DashboardFormTemplateDto })
  formTemplate!: DashboardFormTemplateDto;
}

export class DashboardPendingInvitationDto {
  @ApiProperty({ example: 'inv-001' })
  id!: string;

  @ApiProperty({ example: 'token-abc123' })
  token!: string;

  @ApiProperty({ example: 'ther-001' })
  therapistId!: string;

  @ApiProperty({ example: 'cli-001' })
  clientId!: string;

  @ApiProperty({ example: 'form-001' })
  formTemplateId!: string;

  @ApiProperty({ example: false })
  isCompleted!: boolean;

  @ApiProperty({ example: '2025-07-20T12:00:00.000Z', format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ example: '2025-08-01T10:00:00.000Z', format: 'date-time', nullable: true })
  expiresAt?: string | null;

  @ApiProperty({ type: DashboardClientDto })
  client!: DashboardClientDto;

  @ApiProperty({ type: DashboardFormTemplateDto })
  formTemplate!: DashboardFormTemplateDto;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: [DashboardFormResponseDto] })
  formResponses!: DashboardFormResponseDto[];

  @ApiProperty({ type: [DashboardPendingInvitationDto] })
  pendingInvitations!: DashboardPendingInvitationDto[];
}
