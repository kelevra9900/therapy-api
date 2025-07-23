// src/common/helpers/paginate.ts
import { Prisma } from '@prisma/client';
import { QueryOptionsDto } from '@/common/dtos/query-options.dto';

export async function paginate<T>(
  model: {
    findMany: Function;
    count: Function;
  },
  query: QueryOptionsDto,
  options?: {
    where?: Prisma.PrismaClientKnownRequestError | any;
    searchField?: string;
    searchValue?: string;
    orderBy?: Prisma.Enumerable<Prisma.SortOrder> | any;
    select?: Prisma.Enumerable<any>;
  },
) {
  const page = query.page || 1;
  const limit = query.limit || 10;

  const where = {
    ...(options?.where || {}),
    ...(options?.searchField && options?.searchValue && {
      [options.searchField]: {
        contains: options.searchValue,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
  };

  const [items, total] = await Promise.all([
    model.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: options?.orderBy || { createdAt: 'desc' },
      select: options?.select,
    }),
    model.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
