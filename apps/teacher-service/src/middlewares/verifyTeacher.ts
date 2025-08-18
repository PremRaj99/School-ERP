import { asyncHandler } from '@repo/responsehandler';
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@repo/errorhandler';
export const TeacherOnly = asyncHandler((
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || !req.user.id || !req.user.role) {
        throw new ForbiddenError()
    }
    if (req.user.role !== "Teacher") {
        throw new ForbiddenError()
    }
    next()
})
