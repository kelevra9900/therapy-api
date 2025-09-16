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
  const page = Number((query as any).page) || 1;
  const limit = Number((query as any).limit) || 10;
  const rawSearch = typeof options?.searchValue === 'string' ? options?.searchValue.trim() : options?.searchValue;

  const where = {
    ...(options?.where || {}),
    ...(options?.searchField && rawSearch && {
      [options.searchField]: {
        contains: rawSearch,
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
