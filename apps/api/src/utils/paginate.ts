export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  total: number;
  totalPages: number;
}

export function paginate(options: PaginationOptions): PaginationResult {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    total: 0, // Will be set after count query
    totalPages: 0, // Will be calculated after count query
  };
}

export function paginationResponse(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function paginateWithCount<T>(
  options: PaginationOptions,
  countFn: () => Promise<number>,
  dataFn: (skip: number, limit: number) => Promise<T[]>
): Promise<{ data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const p = paginate(options);
  const total = await countFn();
  const data = await dataFn(p.skip, p.limit);
  return {
    data,
    pagination: paginationResponse(total, p.page, p.limit),
  };
}
