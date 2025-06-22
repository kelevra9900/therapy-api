import { ApiProperty } from '@nestjs/swagger';

export class ClientDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  email?: string;
}
