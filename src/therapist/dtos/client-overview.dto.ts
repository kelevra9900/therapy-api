import { ApiProperty } from '@nestjs/swagger';
import { ClientDto } from './client.dto';
import { FormInvitationResponseDto } from '@/forms/dtos/form-invitation-response.dto';
import { TherapistFormResponseDto } from './therapist-form-response.dto';

export class ClientOverviewDto {
  @ApiProperty({ type: ClientDto })
  client: ClientDto;

  @ApiProperty({ type: [FormInvitationResponseDto] })
  pendingInvitations: FormInvitationResponseDto[];

  @ApiProperty({ type: TherapistFormResponseDto, nullable: true })
  latestResponse: TherapistFormResponseDto | null;
}

