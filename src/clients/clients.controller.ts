import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth,ApiBody,ApiOperation,ApiResponse,ApiTags} from '@nestjs/swagger';
import {ClientsService} from './clients.service';
import {AuthGuard} from '@/auth/auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/roles.decorator';
import {CreateClientDto} from './dtos/create-client.dto';
import {User} from '@/common/decorators/user.decorator';
import {JwtPayload} from '@/auth/types';
import {ClientResponseDto} from './dtos/client-response.dto';
import {Role} from '@prisma/client';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(AuthGuard,RolesGuard)
@Roles(Role.THERAPIST)
export class ClientsController {
	constructor(private readonly clientService: ClientsService) { }

  @Post()
  @ApiOperation({ summary: 'Crear cliente vinculado al terapeuta' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, type: ClientResponseDto })
  create(@Body() dto: CreateClientDto, @User() user: JwtPayload) {
    return this.clientService.create(dto, user);
  }
}
