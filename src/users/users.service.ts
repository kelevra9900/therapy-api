import {ForbiddenException,Injectable,NotFoundException} from '@nestjs/common';
import {format} from 'date-fns';

import {PrismaService} from '../prisma/prisma.service';
import {QueryOptionsDto} from '../common/dtos/query-options.dto';
import {PaginatedResponse} from '../common/types/paginated-response.type';
import {UserResponseDto} from './dtos/user-response.dto';
import {JwtPayload} from '@/auth/types';
import {UpdateUserDto} from './dtos/update-user.dto';


@Injectable()
export class UsersService {

  constructor(
    private readonly prismaService: PrismaService
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
}