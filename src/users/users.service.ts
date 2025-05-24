import {Injectable} from '@nestjs/common';
import { format } from 'date-fns';

import {PrismaService} from '../prisma/prisma.service';
import {QueryOptionsDto} from '../common/dtos/query-options.dto';
import {PaginatedResponse} from '../common/types/paginated-response.type';
import {UserResponseDto} from './dtos/user-response.dto';


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
      createdAt: format(user.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    };
  }

  async getAllUsers(query: QueryOptionsDto): Promise<PaginatedResponse<UserResponseDto>> {
    const {page = 1,limit = 10,search} = query;

    const where: any = search ? {
      OR: [
        {name: {contains: search,mode: 'insensitive'}},
        {email: {contains: search,mode: 'insensitive'}},
      ],
    } : {};

    const users = await this.prismaService.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
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

    const serializedUsers: UserResponseDto[] = users.map(user => ({
      ...user,
      createdAt: format(user.createdAt, 'yyyy-MM-dd'),
    }));
    const totalCount = await this.prismaService.user.count({where});
    const totalPages = Math.ceil(totalCount / limit);
    return {
      data: serializedUsers,
      meta: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    };
  }
}
