import { type Request, type Response, type NextFunction } from 'express';
import { type ZodSchema } from 'zod';
import { validate } from '../utils/validation';

export function validateBody(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = validate(schema, req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.query = validate(schema, req.query) as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.params = validate(schema, req.params) as any;
      next();
    } catch (error) {
      next(error);
    }
  };
}
