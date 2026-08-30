import { type Request, type Response, type NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { env } from '../config/env';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  // Handle AppError (operational errors)
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };

    if (err instanceof ValidationError) {
      response.error.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle Zod errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        errors: (err as any).format ? (err as any).format() : undefined,
      },
    });
  }

  // Handle MongoDB errors
  if (err.name === 'MongoServerError') {
    if ((err as any).code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'A resource with this information already exists',
        },
      });
    }
  }

  // Unexpected error
  console.error('Unexpected error:', err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    },
  });
}
