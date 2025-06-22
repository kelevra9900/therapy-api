import {ForbiddenException,Injectable,Logger,NotFoundException} from '@nestjs/common';
import {format} from 'date-fns';

import {PrismaService} from '../prisma/prisma.service';
import {QueryOptionsDto} from '../common/dtos/query-options.dto';
import {PaginatedResponse} from '../common/types/paginated-response.type';
import {UserResponseDto} from './dtos/user-response.dto';
import {JwtPayload} from '@/auth/types';
import {UpdateUserDto} from './dtos/update-user.dto';
import {RegisterDto} from '@/auth/dto/auth.dto';
import {AuthService} from '@/auth/auth.service';
import {Role, SubscriptionStatus} from '@prisma/index';


@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);


  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
  ) {
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prismaService.user.findUnique({
      where: {id},
      select: {
        id: true,
        avatar: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...user,
      createdAt: format(user.createdAt,'yyyy-MM-dd HH:mm:ss'),
    };
  }

  async getAllUsers(query: QueryOptionsDto,user: JwtPayload): Promise<PaginatedResponse<UserResponseDto>> {
    const {page = 1,limit = 10,search} = query;

    const baseSearchCondition = search
      ? {
        OR: [
          {name: {contains: search,mode: 'insensitive'}},
          {email: {contains: search,mode: 'insensitive'}},
        ],
      }
      : {};

    let where: any = {};


    if (user.role === 'ADMIN') {
      where = {
        ...baseSearchCondition,
        id: {not: user.sub},
      };
    } else if (user.role === 'THERAPIST') {
      where = {
        ...baseSearchCondition,
        clients: {
          some: {
            therapistId: user.sub,
          },
        },
      };
    } else {
      throw new ForbiddenException('Access denied');
    }

    const [items,total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {createdAt: 'desc'},
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          subscriptionStatus: true,
          createdAt: true,
        },
      }),
      this.prismaService.user.count({where}),
    ]);

    return {
      data: items.map(item => ({
        ...item,
        createdAt: format(item.createdAt,'yyyy-MM-dd HH:mm:ss'),
      })),
      meta: {
        totalCount: total,
        currentPage: page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  }


  async updateUser(id: string,dto: UpdateUserDto,user: JwtPayload): Promise<UserResponseDto> {
    this.logger.log(`Updating user with ID: ${id} by user with ID: ${user.sub}`);
    this.logger.log(`User role: ${user.role}`);
    this.logger.log(`Update data: ${JSON.stringify(dto)}`);
    const targetUser = await this.prismaService.user.findUnique({
      where: {id},
      include: {
        clients: true,
      },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'ADMIN') {
      if (id === user.sub) {
        throw new ForbiddenException('Admins cannot update themselves');
      }
    } else if (user.role === 'THERAPIST') {
      const isClient = await this.prismaService.client.findFirst({
        where: {
          id,
          therapistId: user.sub,
        },
      });

      if (!isClient) {
        throw new ForbiddenException('You can only update your own clients');
      }
    } else {
      throw new ForbiddenException('Access denied');
    }

    const updated = await this.prismaService.user.update({
      where: {id},
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    return {
      ...updated,
      createdAt: format(updated.createdAt,'yyyy-MM-dd HH:mm:ss'),
    };
  }


  // Delete a user
  async deleteUser(id: string): Promise<{message: string}> {
    const user = await this.prismaService.user.findUnique({
      where: {id},
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.user.delete({
      where: {id},
    });

    return {
      message: 'User deleted successfully',
    }
  }

  async createUser({email,password,name}: RegisterDto): Promise<UserResponseDto> {
    const hashedPassword = await this.authService.hashPassword(password);
    const newUser = await this.prismaService.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: Role.THERAPIST,
        subscriptionStatus: SubscriptionStatus.INACTIVE
      },
    });
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isActive: newUser.isActive,
      subscriptionStatus: newUser.subscriptionStatus,
      createdAt: format(newUser.createdAt,'yyyy-MM-dd HH:mm:ss'),
    };
  }
}