import { paginate, paginationResponse, paginateWithCount } from '../utils/paginate';

describe('paginate', () => {
  it('returns default pagination when no options provided', () => {
    const result = paginate({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.skip).toBe(0);
  });

  it('calculates correct skip for page 2', () => {
    const result = paginate({ page: 2, limit: 10 });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(10);
  });

  it('clamps page to minimum 1', () => {
    const result = paginate({ page: -1 });
    expect(result.page).toBe(1);
  });

  it('clamps limit between 1 and 100', () => {
    expect(paginate({ limit: -5 }).limit).toBe(1);
    expect(paginate({ limit: 200 }).limit).toBe(100);
    expect(paginate({ limit: 0 }).limit).toBe(20); // 0 defaults to 20
  });
});

describe('paginationResponse', () => {
  it('calculates total pages correctly', () => {
    const result = paginationResponse(25, 1, 10);
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
  });

  it('handles zero total', () => {
    const result = paginationResponse(0, 1, 10);
    expect(result.totalPages).toBe(0);
  });
});

describe('paginateWithCount', () => {
  it('returns data and pagination', async () => {
    const result = await paginateWithCount(
      { page: 1, limit: 10 },
      async () => 25,
      async (skip, limit) => Array.from({ length: Math.min(limit, 25 - skip) }, (_, i) => skip + i)
    );

    expect(result.data).toHaveLength(10);
    expect(result.pagination.total).toBe(25);
    expect(result.pagination.totalPages).toBe(3);
  });
});
