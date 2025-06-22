export class ClientResponseDto {
  id: string;
  name: string;
  email?: string;
  birthDate?: string; // ISO date string
  gender?: string;
  notes?: string;
  createdAt: Date;
  therapistId: string;
}
