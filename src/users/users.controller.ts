import { Controller, Get, HttpCode, Param, Query, UseGuards } from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';

import {UsersService} from './users.service';
import {AuthGuard} from '../auth/auth.guard';
import {JwtPayload} from '../auth/types';
import {User} from '../utils/user.decorator';
import {Roles} from '../common/roles.decorator';
import {Role} from 'generated/prisma';
import {QueryOptionsDto} from '../common/dtos/query-options.dto';
import {RolesGuard} from '../common/guards/roles.guard';


@ApiTags('Control of users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
	) {}

	@Get('me')
	@UseGuards(AuthGuard)
	getMe(
		@User() user: JwtPayload
	) {
		return user;
	}

	@Get('all')
	@HttpCode(200)
	@UseGuards(AuthGuard, RolesGuard)
	@Roles(Role.ADMIN)
	getAllUsers(
		@Query() query: QueryOptionsDto
	){
		return this.usersService.getAllUsers(query);
	}

  	@Get(':id')
	@UseGuards(AuthGuard, RolesGuard)
	@Roles(Role.ADMIN)
	getUser(
  		@Param('id') id: string,
	){
		return  this.usersService.findOne(id);
	}

}
