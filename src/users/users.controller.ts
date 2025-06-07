import {Body,Controller,Get,HttpCode,Param,Put,Query,UseGuards} from '@nestjs/common';
import {ApiBearerAuth,ApiTags} from '@nestjs/swagger';
import {Role} from '@prisma/index';

import {UsersService} from './users.service';
import {AuthGuard} from '@/auth/auth.guard';
import {JwtPayload} from '@/auth/types';
import {User} from '@/common/decorators/user.decorator';
import {Roles} from '@/common/roles.decorator';
import {QueryOptionsDto} from '@/common/dtos/query-options.dto';
import {RolesGuard} from '@/common/guards/roles.guard';
import {PaginatedResponse} from '@/common/types/paginated-response.type';
import {UserResponseDto} from './dtos/user-response.dto';
import {UpdateUserDto} from './dtos/update-user.dto';


@ApiTags('Control of users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
	) { }

	@Get('me')
	@UseGuards(AuthGuard)
	getMe(
		@User() user: JwtPayload
	) {
		return this.usersService.findOne(user.sub);
	}

	@Get('all')
	@HttpCode(200)
	@UseGuards(AuthGuard,RolesGuard)
	@Roles(Role.ADMIN)
	getAllUsers(
		@Query() query: QueryOptionsDto,
		@User() user: JwtPayload
	): Promise<PaginatedResponse<UserResponseDto>> {
		return this.usersService.getAllUsers(query,user);
	}

	@Get(':id')
	@UseGuards(AuthGuard,RolesGuard)
	@Roles(Role.ADMIN)
	getUser(
		@Param('id') id: string,
	) {
		return this.usersService.findOne(id);
	}
	@Put(':id')
	@UseGuards(AuthGuard,RolesGuard)
	@Roles(Role.ADMIN,Role.THERAPIST)
	updateUser(
		@Param('id') id: string,
		@User() user: JwtPayload,
		@Body() dto: UpdateUserDto,
	) {
		return this.usersService.updateUser(id,dto,user);
	}
}
