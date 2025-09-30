import { Role } from "@prisma/client";
import { Injectable } from "@nestjs/common";

import {PrismaService} from '@/prisma/prisma.service';
import { DashboardSummaryDto } from "./dtos/dashboard-summary.dto";
import {JwtPayload} from "@/auth/types";

@Injectable()
export class DashboardService {
	constructor(private readonly prisma: PrismaService) { }

	async dashboardSummary(user: JwtPayload): Promise<DashboardSummaryDto> {
		const isAdmin = user.role === Role.ADMIN;
		const therapistFilter = isAdmin ? {} : { therapistId: user.sub };

		const [formResponses, pendingInvitations] = await this.prisma.$transaction([
			this.prisma.formResponse.findMany({
				where: therapistFilter,
				orderBy: { filledAt: "desc" },
				take: 10,
				include: {
					client: {
						select: {
							id: true,
							name: true,
							email: true,
							gender: true,
						},
					},
					formTemplate: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			}),
			this.prisma.formInvitation.findMany({
				where: {
					...therapistFilter,
					isCompleted: false,
				},
				orderBy: { createdAt: "desc" },
				take: 10,
				include: {
					client: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					formTemplate: {
						select: {
							id: true,
							title: true,
						},
					},
				},
			}),
		]);

		return {
			formResponses: formResponses.map((response) => ({
				id: response.id,
				filledAt: response.filledAt.toISOString(),
				level: response.level,
				client: {
					id: response.client.id,
					name: response.client.name,
					email: response.client.email,
					gender: response.client.gender,
				},
				formTemplate: {
					id: response.formTemplate.id,
					title: response.formTemplate.title,
				},
			})),
			pendingInvitations: pendingInvitations.map((invitation) => ({
				id: invitation.id,
				token: invitation.token,
				therapistId: invitation.therapistId,
				clientId: invitation.clientId,
				formTemplateId: invitation.formTemplateId,
				isCompleted: invitation.isCompleted,
				createdAt: invitation.createdAt.toISOString(),
				expiresAt: invitation.expiresAt ? invitation.expiresAt.toISOString() : null,
				client: {
					id: invitation.client.id,
					name: invitation.client.name,
					email: invitation.client.email,
				},
				formTemplate: {
					id: invitation.formTemplate.id,
					title: invitation.formTemplate.title,
				},
			})),
		};
	}
}
