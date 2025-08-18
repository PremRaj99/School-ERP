import { asyncHandler } from '@repo/responsehandler';
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@repo/errorhandler';
export const StudentOnly = asyncHandler((
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user || !req.user.id || !req.user.role) {
        throw new ForbiddenError()
    }
    if (req.user.role !== "Student") {
        throw new ForbiddenError()
    }
    next()
})
