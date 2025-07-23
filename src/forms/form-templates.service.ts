import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {Role} from '@prisma/client';
import {format} from 'date-fns';

import {PrismaService} from '@/prisma/prisma.service';
import {QueryOptionsDto} from '@/common/dtos/query-options.dto';
import {JwtPayload} from '@/auth/types';
import {CreateFormTemplateDto} from '@/form-templates/dtos/create-form-template.dto';

@Injectable()
export class FormTemplatesService {
	constructor(private readonly prisma: PrismaService) { }

	async create(dto: CreateFormTemplateDto,user: JwtPayload) {
		if (user.role !== Role.ADMIN) {
			throw new ForbiddenException('Only admins can create form templates.');
		}

		const created = await this.prisma.formTemplate.create({
			data: {
				title: dto.title,
				description: dto.description ?? '',
				createdBy: user.sub,
				isActive: dto.isActive,
			},
		});

		return {
			id: created.id,
			title: created.title,
			description: created.description,
			isActive: created.isActive,
			createdBy: created.createdBy,
		};
	}

	async findAll(query: QueryOptionsDto) {
		const {page = 1,limit = 10,search} = query;

		const where: any = search
			? {
				OR: [
					{title: {contains: search,mode: 'insensitive'}},
					{description: {contains: search,mode: 'insensitive'}},
				],
			}
			: {};

		const [items,total] = await Promise.all([
			this.prisma.formTemplate.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: {createdAt: 'desc'},
			}),
			this.prisma.formTemplate.count({where}),
		]);

		return {
			data: items.map((item) => ({
				id: item.id,
				title: item.title,
				description: item.description,
				isActive: item.isActive,
				createdBy: item.createdBy,
				createdAt: format(item.createdAt,'yyyy-MM-dd HH:mm:ss'),
			})),
			meta: {
				totalCount: total,
				currentPage: page,
				pageSize: limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async findOne(id: string) {
		const form = await this.prisma.formTemplate.findUnique({where: {id}});
		if (!form) throw new NotFoundException('Form template not found');

		return {
			id: form.id,
			title: form.title,
			description: form.description,
			isActive: form.isActive,
			createdBy: form.createdBy,
			createdAt: format(form.createdAt,'yyyy-MM-dd HH:mm:ss'),
		};
	}

	async remove(id: string,user: JwtPayload) {
		if (user.role !== Role.ADMIN) {
			throw new ForbiddenException('Only admins can delete form templates.');
		}

		const form = await this.prisma.formTemplate.findUnique({where: {id}});
		if (!form) throw new NotFoundException('Form template not found');

		await this.prisma.formTemplate.delete({where: {id}});

		return {message: 'Form template deleted successfully'};
	}

	async getAll(query: QueryOptionsDto) {
		const {page = 1,limit = 10,search} = query;

		const where: any = search
			? {
				OR: [
					{
						title: {
							contains: search,
							mode: 'insensitive',
						},
					},
					{
						description: {
							contains: search,
							mode: 'insensitive',
						},
					},
				],
			}
			: undefined;

		const [items,total] = await Promise.all([
			this.prisma.formTemplate.findMany({
				where,
				skip: (page - 1) * limit,
				take: limit,
				orderBy: {createdAt: 'desc'},
			}),
			this.prisma.formTemplate.count({where}),
		]);

		return {
			data: items.map((item) => ({
				id: item.id,
				title: item.title,
				description: item.description,
				isActive: item.isActive,
				createdBy: item.createdBy,
				createdAt: format(item.createdAt,'yyyy-MM-dd HH:mm:ss'),
			})),
			meta: {
				totalCount: total,
				currentPage: page,
				pageSize: limit,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	async getById(id: string) {
		const form = await this.prisma.formTemplate.findUnique({
			where: {id},
			include: {
				questions: {
					orderBy: {order: 'asc'},
				},
			},
		});

		if (!form) throw new NotFoundException('Form template not found');

		return {
			id: form.id,
			title: form.title,
			description: form.description,
			isActive: form.isActive,
			createdBy: form.createdBy,
			createdAt: format(form.createdAt,'yyyy-MM-dd HH:mm:ss'),
			questions: form.questions.map((q) => ({
				id: q.id,
				text: q.text,
				type: q.type,
				options: q.options,
				order: q.order,
			})),
		};
	}
}
