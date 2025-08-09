import { asyncHandler } from '@repo/responsehandler';
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '@repo/errorhandler';
export const AdminOnly = asyncHandler((
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.user) {
        throw new ForbiddenError()
    }
    if (req.user.role !== "Admin") {
        throw new ForbiddenError()
    }
    next()
})
