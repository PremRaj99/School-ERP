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
  let code = 'INTERNAL_ERROR';
  let issues: { path: string; message: string }[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
    issues = err.issues;
  }

  logger.error('Unhandled Error', {
    statusCode,
    message,
    code,
    method: req.method,
    url: req.originalUrl,
    stack: err instanceof Error ? err.stack : undefined,
  });

  // `success`/`message` are the original fields — every existing caller keeps working.
  // `statusCode`/`code`/`issues` are additive (ALIGNMENT_PLAN.md 2B/N3): `issues` lets a
  // contract-aware form map a 400 straight back onto the field that failed.
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    code,
    ...(issues ? { issues } : {}),
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
