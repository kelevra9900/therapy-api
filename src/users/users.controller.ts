import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { Role } from 'generated/prisma';
import { UsersService } from './users.service';
import { AuthGuard } from '@/auth/auth.guard';
import { JwtPayload } from '@/auth/types';
import { User } from '@/common/decorators/user.decorator';
import { Roles } from '@/common/roles.decorator';
import { QueryOptionsDto } from '@/common/dtos/query-options.dto';
import { RolesGuard } from '@/common/guards/roles.guard';
import { PaginatedResponse } from '@/common/types/paginated-response.type';
import { UserResponseDto } from './dtos/user-response.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { RegisterDto } from '@/auth/dto/auth.dto';
import {PaginatedUserResponseDto} from './dtos/paginated-user-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  getMe(@User() user: JwtPayload) {
    return this.usersService.findOne(user.sub);
  }

  @Get('all')
  @HttpCode(200)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all users (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of users',
    type: PaginatedUserResponseDto,
  })
  getAllUsers(
    @Query() query: QueryOptionsDto,
    @User() user: JwtPayload,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    return this.usersService.getAllUsers(query, user);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User found', type: UserResponseDto })
  getUser(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated', type: UserResponseDto })
  updateUser(
    @Param('id') id: string,
    @User() user: JwtPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, dto, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'User deleted', schema: {
    example: { message: 'User deleted successfully' },
  }})
  deleteUser(@Param('id') id: string): Promise<{ message: string }> {
    return this.usersService.deleteUser(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.THERAPIST)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  createUser(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.usersService.createUser(dto);
  }
}
