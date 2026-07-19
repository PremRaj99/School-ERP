import { NextFunction, Request, Response } from 'express';
import {
  ForbiddenError,
  NotFoundError,
  TooManyRequestError,
  UnauthorizedError,
  ValidationError,
  ApiError,
  DatabaseError,
} from './ApiError';
import { validateSchema } from './validateSchema';
import { logger } from '../logger/logger';

export const errorHandlerMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  logger.error('Unhandled Error', {
    statusCode,
    message,
    method: req.method,
    url: req.originalUrl,
    stack: err instanceof Error ? err.stack : undefined,
  });

  return res.status(statusCode).json({
    message,
    success: false,
  });
};

export {
  ForbiddenError,
  NotFoundError,
  TooManyRequestError,
  UnauthorizedError,
  ValidationError,
  ApiError,
  DatabaseError,
  validateSchema,
};
