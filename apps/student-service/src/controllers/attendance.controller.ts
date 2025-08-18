import prisma from '@repo/db';
import { validateSchema } from '@repo/errorhandler';
import { getMonthStartEnd } from '@repo/helper';
import { asyncHandler, OkResponse } from '@repo/responsehandler';
import { monthSchema } from '@repo/types';
import { NextFunction, Request, Response } from 'express';

export const getAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const monthString = validateSchema(monthSchema, req.query.month)

    const { endDate, startDate } = getMonthStartEnd(monthString)

    const studentAttendance = await prisma.studentAttendance.findMany({
        where: {
            date: {
                gte: startDate,
                lt: endDate,
            },
            studentId: req.user?.id
        }
    })

    res.status(200).json(new OkResponse(studentAttendance.map(a => ({
        date: a.date,
        status: a.status
    }))))
})