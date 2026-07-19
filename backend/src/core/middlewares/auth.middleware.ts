import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../config/constants';
import { UnauthorizedError, ForbiddenError } from '../errors';
import { asyncHandler } from '../responses';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: string;
    };
  }
}

export const verifyJWT = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  const header = req.cookies?.['access_token'] || req.headers.authorization;
  const token = header?.split(' ')[1];

  if (!token) {
    throw new UnauthorizedError();
  }

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      id: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (_error) {
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
