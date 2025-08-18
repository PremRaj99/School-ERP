import prisma from "@repo/db";
import { asyncHandler, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';

export const getAcademicCalenderEvent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const calendar = await prisma.academicCalendar.findMany({
        select: {
            category: true,
            id: true,
            date: true,
            title: true
        }
    })
    res.status(200).json(new OkResponse(calendar))
})