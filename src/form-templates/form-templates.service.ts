import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {format} from 'date-fns';
import {PrismaService} from '@/prisma/prisma.service';
import {Role} from '@prisma/client';

import {CreateFormTemplateDto} from './dtos/create-form-template.dto';
import {UpdateFormTemplateDto} from './dtos/update-form-template.dto';
import {QueryOptionsDto} from '@/common/dtos/query-options.dto';
import {JwtPayload} from '@/auth/types';

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
				isActive: dto.isActive,
				createdBy: user.sub,
				questions: {
					create: dto.questions.map((q) => ({
						text: q.text,
						type: q.type,
						options: q.options ?? {},
						order: q.order,
					})),
				},
			},
			include: {questions: true},
		});

		return {
			id: created.id,
			title: created.title,
			description: created.description,
			isActive: created.isActive,
			createdBy: created.createdBy,
			createdAt: format(created.createdAt,'yyyy-MM-dd HH:mm:ss'),
			questions: created.questions.map((q) => ({
				id: q.id,
				text: q.text,
				type: q.type,
				options: q.options,
				order: q.order,
			})),
		};
	}

	async getAll(query: QueryOptionsDto) {
		const {page = 1,limit = 10,search} = query;

		const where = search
			? {
				OR: [
					{
						title: {
							contains: search,
							mode: 'insensitive' as const,
						},
					},
					{
						description: {
							contains: search,
							mode: 'insensitive' as const,
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
				include: {questions: true},
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
				questions: item.questions.map((q) => ({
					id: q.id,
					text: q.text,
					type: q.type,
					options: q.options,
					order: q.order,
				})),
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
			include: {questions: true},
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

	async update(id: string,dto: UpdateFormTemplateDto,user: JwtPayload) {
		if (user.role !== Role.ADMIN) {
			throw new ForbiddenException('Only admins can update form templates.');
		}

		const form = await this.prisma.formTemplate.findUnique({where: {id}});
		if (!form) throw new NotFoundException('Form template not found');

		await this.prisma.formTemplate.update({
			where: {id},
			data: {
				title: dto.title,
				description: dto.description,
				isActive: dto.isActive,
				updatedAt: new Date(),
			},
		});

		if (dto.questions) {
			await this.prisma.question.deleteMany({
				where: {formTemplateId: id},
			});

			await this.prisma.question.createMany({
				data: dto.questions.map((q) => ({
					formTemplateId: id,
					text: q.text,
					type: q.type,
					options: q.options ?? {},
					order: q.order,
				})),
			});
		}

		const final = await this.prisma.formTemplate.findUnique({
			where: {id},
			include: {questions: true},
		});

		if (!final) throw new NotFoundException('Form template not found');

		return {
			id: final.id,
			title: final.title,
			description: final.description,
			isActive: final.isActive,
			createdBy: final.createdBy,
			createdAt: format(final.createdAt,'yyyy-MM-dd HH:mm:ss'),
			questions: final.questions.map((q) => ({
				id: q.id,
				text: q.text,
				type: q.type,
				options: q.options,
				order: q.order,
			})),
		};
	}
	async delete(id: string) {
		const form = await this.prisma.formTemplate.findUnique({where: {id}});
		if (!form) throw new NotFoundException('Form template not found');
		await this.prisma.formTemplate.delete({where: {id}});
		return {message: 'Form template deleted successfully'};
	}
}
