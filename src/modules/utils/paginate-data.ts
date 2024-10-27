import type { Pagination } from 'nestjs-typeorm-paginate';
import type { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import type { IPaginateOptions } from './types';

export async function paginateData<TEntity extends ObjectLiteral>(
  query: SelectQueryBuilder<TEntity>,
  options: IPaginateOptions
): Promise<Pagination<TEntity>> {
  const page = Number(options.page);
  const limit = Number(options.limit);
  const skip = (page - 1) * limit;

  const items = await query.skip(skip).take(limit).getMany();

  const totalItems = await query.getCount();

  return {
    items,
    meta: {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  };
}
