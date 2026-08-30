import { AppError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';

describe('AppError', () => {
  it('creates error with correct properties', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.isOperational).toBe(true);
  });

  it('is instance of Error', () => {
    const error = new AppError('Test', 500, 'TEST');
    expect(error).toBeInstanceOf(Error);
  });
});

describe('Specific error classes', () => {
  it('BadRequestError has 400 status', () => {
    const error = new BadRequestError('Bad');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
  });

  it('UnauthorizedError has 401 status', () => {
    const error = new UnauthorizedError('Unauthorized');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('ForbiddenError has 403 status', () => {
    const error = new ForbiddenError('Forbidden');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('NotFoundError has 404 status', () => {
    const error = new NotFoundError('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('ConflictError has 409 status', () => {
    const error = new ConflictError('Conflict');
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  it('uses default messages', () => {
    expect(new BadRequestError().message).toBe('Bad request');
    expect(new UnauthorizedError().message).toBe('Unauthorized');
    expect(new NotFoundError().message).toBe('Resource not found');
  });
});
