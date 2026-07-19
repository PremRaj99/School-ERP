import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../config/constants';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { asyncHandler } from '../responses';
import { logger } from '../logger/logger';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}

export const verifyJWT = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  let token = req.cookies?.['access_token'];
  if (!token && req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError();
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      id: string;
      role: string;
    };
    if (!/^[0-9a-fA-F]{24}$/.test(decoded.id)) {
      throw new UnauthorizedError();
    }
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid access token', { error });
    throw new UnauthorizedError();
  }
});

export const AdminOnly = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'Admin') {
    throw new ForbiddenError();
  }
  next();
});

export const StudentOnly = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id || !req.user.role || req.user.role !== 'Student') {
    throw new ForbiddenError();
  }
  next();
});

export const TeacherOnly = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id || !req.user.role || req.user.role !== 'Teacher') {
    throw new ForbiddenError();
  }
  next();
});
