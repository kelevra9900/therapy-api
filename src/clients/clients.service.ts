// src/modules/clients/clients.service.ts
import {ForbiddenException,Injectable,NotFoundException} from '@nestjs/common';
import {PrismaService} from '@/prisma/prisma.service';
import {QueryOptionsDto} from '@/common/dtos/query-options.dto';
import {paginate} from '@/utils/helpers/paginate';
import {UpdateClientDto} from './dtos/update-client.dto';
import {JwtPayload} from '@/auth/types';
import {ClientResponseDto} from './dtos/client-response.dto';
import {CreateClientDto} from '@/therapist/dtos/create-client.dto';
@Injectable()
export class ClientsService {
	constructor(
		private readonly prisma: PrismaService,
	) { }

	async createClient(dto: CreateClientDto,therapistId: string) {
		const therapistExists = await this.prisma.user.findUnique({
			where: {id: therapistId},
		});

		if (!therapistExists) {
			throw new NotFoundException('Therapist not found');
		}

		const client = await this.prisma.client.create({
			data: {
				...dto,
				therapistId,
				birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
			},
			select: {
				id: true,
				name: true,
				email: true,
				birthDate: true,
				gender: true,
				notes: true,
				createdAt: true,
			},
		});

		return client;
	}
	async create(dto: CreateClientDto,user: JwtPayload): Promise<ClientResponseDto> {

		const existingClient = await this.prisma.client.findFirst({
			where: {
				email: dto.email,
				therapistId: user.sub,
			},
		});
		if (existingClient) {
			throw new ForbiddenException('Client with this email already exists');
		}
		const newClient = await this.prisma.client.create({
			data: {
				name: dto.name,
				email: dto.email,
				birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
				gender: dto.gender,
				notes: dto.notes,
				therapistId: user.sub,
			},
		});

		return {
			id: newClient.id,
			name: newClient.name,
			email: newClient.email ?? '',
			birthDate: newClient.birthDate ? newClient.birthDate.toISOString().split('T')[0] : undefined,
			gender: newClient.gender ?? undefined,
			notes: newClient.notes ?? '',
			therapistId: newClient.therapistId,
			createdAt: new Date()
		};
	}

	async getClientsByTherapist(therapistId: string,query: QueryOptionsDto) {
		return paginate(this.prisma.client,query,{
			where: {therapistId},
			searchField: 'name',
			searchValue: query.search,
			select: {
				id: true,
				name: true,
				email: true,
				birthDate: true,
				gender: true,
				notes: true,
				createdAt: true,
			},
		});
	}


	async getClientById(id: string,therapistId: string) {
		const client = await this.prisma.client.findUnique({
			where: {id},
			include: {
				formResponses: {
					select: {
						id: true,
						filledAt: true,
						score: true,
						level: true,
					},
				},
			},
		});

		if (!client) {
			throw new NotFoundException('Client not found');
		}

		if (client.therapistId !== therapistId) {
			throw new ForbiddenException('You do not have access to this client');
		}

		return client;
	}


	async updateClient(id: string,therapistId: string,dto: UpdateClientDto) {
		const client = await this.prisma.client.findUnique({
			where: {id},
		});

		if (!client) {
			throw new NotFoundException('Client not found');
		}

		if (client.therapistId !== therapistId) {
			throw new ForbiddenException('You do not have permission to update this client');
		}

		const updated = await this.prisma.client.update({
			where: {id},
			data: {
				...dto,
				birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
			},
			select: {
				id: true,
				name: true,
				email: true,
				birthDate: true,
				gender: true,
				notes: true,
				createdAt: true,
			},
		});

		return updated;
	}
}
