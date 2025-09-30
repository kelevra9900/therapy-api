import {Role} from "@prisma/client";
import {Controller, Get, UseGuards} from "@nestjs/common";
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";

import {RolesGuard} from "@/common/guards/roles.guard";
import {Roles} from "@/common/roles.decorator";
import {AuthGuard} from '@/auth/auth.guard';

import {DashboardService} from "./dashboard.service";
import {JwtPayload} from "@/auth/types";
import {User} from "@/common/decorators/user.decorator";
import {DashboardSummaryDto} from "./dtos/dashboard-summary.dto";

@ApiTags('Admin - Dashboard summary')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.THERAPIST,Role.ADMIN)
export class DashboardController {
	constructor(private readonly service: DashboardService) { }


	@Get()
	@ApiOperation({ summary: 'Obtener datos mock para el dashboard de formularios (temporal)' })
	@ApiResponse({
	  status: 200,
	  description: 'Resumen de respuestas recientes y invitaciones pendientes',
	  type: DashboardSummaryDto,
	})
	async getDashboardSymmary(
		@User() user: JwtPayload,
	){
		return this.service.dashboardSummary(user)
	}
}