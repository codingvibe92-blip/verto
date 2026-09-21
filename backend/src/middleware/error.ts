import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import logger from '../utils/logger';
import { ApiError, isApiError } from '../utils/errors';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({ success: false, message: 'Validation failed', errors });
    return;
  }

  if (isApiError(err)) {
    res.status(err.statusCode).json({ success: false, message: err.message, errors: err.errors });
    return;
  }

  logger.error('Unhandled error', err instanceof Error ? { message: err.message, stack: err.stack } : err);
  res.status(500).json({ success: false, message: 'Internal server error' });
}

export function httpLogger(): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        logger.info(`${req.method} ${req.originalUrl} -> ${res.statusCode}`);
      }
    });
    next();
  };
}