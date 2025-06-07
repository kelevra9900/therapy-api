import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import {ApiBearerAuth,ApiTags} from '@nestjs/swagger';
import {ClientsService} from './clients.service';
import {AuthGuard} from '@/auth/auth.guard';
import {RolesGuard} from '@/common/guards/roles.guard';
import {Roles} from '@/common/roles.decorator';
import {Role} from '@prisma/client';
import {CreateClientDto} from './dtos/create-client.dto';
import {User} from '@/common/decorators/user.decorator';
import {JwtPayload} from '@/auth/types';
import {UpdateClientDto} from './dtos/update-client.dto';

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('clients')
@UseGuards(AuthGuard,RolesGuard)
@Roles(Role.THERAPIST)
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) { }

	@Post()
	async createClient(
		@User() user: JwtPayload,
		@Body() dto: CreateClientDto,
	) {
		return this.clientsService.createClient(dto,user.sub);
	}
	@Get(':id')
	async getClientById(
		@User() user: JwtPayload,
		@Param('id') id: string,
	) {
		return this.clientsService.getClientById(id,user.sub);
	}

	@Put(':id')
	async updateClient(
		@User() user: JwtPayload,
		@Param('id') id: string,
		@Body() dto: UpdateClientDto,
	) {
		return this.clientsService.updateClient(id,user.sub,dto);
	}
}
