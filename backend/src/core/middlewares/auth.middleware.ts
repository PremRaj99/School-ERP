import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../config/constants';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../errors';
import { asyncHandler } from '../responses';
import { logger } from '../logger/logger';
import prisma from '../db';

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

/** `modules/finance` (ALIGNMENT_PLAN.md P4) — the `Finance` role previously had nowhere to go. */
export const FinanceOnly = asyncHandler((req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.id || !req.user.role || req.user.role !== 'Finance') {
    throw new ForbiddenError();
  }
  next();
});

/**
 * `req.user.id` is the **User** row's id — the login identity, not the Teacher/Student profile.
 * A handful of controllers used to pass `req.user?.id` straight into a `teacherId`/`studentId`
 * filter as if it were the same thing, which silently matched nothing (ALIGNMENT_PLAN.md 2A/B1–B4).
 * These resolve the real profile id once, in one place, instead of duplicating the lookup — and
 * throwing `NotFoundError` if a Teacher/Student row somehow doesn't exist for an authenticated
 * Teacher/Student user (should be unreachable given how accounts are created, but fails loudly
 * rather than silently if it ever isn't).
 */
export const resolveTeacherId = async (req: Request): Promise<string> => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId: req.user!.id },
    select: { id: true },
  });
  if (!teacher) {
    throw new NotFoundError('Teacher profile not found for this account.');
  }
  return teacher.id;
};

export const resolveStudentId = async (req: Request): Promise<string> => {
  const student = await prisma.student.findUnique({
    where: { userId: req.user!.id },
    select: { id: true },
  });
  if (!student) {
    throw new NotFoundError('Student profile not found for this account.');
  }
  return student.id;
};
