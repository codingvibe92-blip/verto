import type { NextFunction, Request, Response } from 'express';
import type { AnyZodObject } from 'zod';

type Handler = (req: Request, res: Response, next: NextFunction) => Promise<unknown> | unknown;

export function asyncHandler(fn: Handler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validate(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse({ body: req.body, query: req.query, params: req.params }).body;
      next();
    } catch (err) {
      next(err);
    }
  };
}