import prisma from "@repo/db";
import { NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { CreatAacademicCalendarSchema } from "@repo/types";

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

export const createAcademicCalender = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const parseData = validateSchema(CreatAacademicCalendarSchema, req.body)

    await prisma.academicCalendar.create({
        data: {
            date: parseData.date,
            title: parseData.title,
            category: parseData.category
        }
    })
    res.status(201).json(new CreatedResponse())
})

export const deleteAcademicCalendar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { calendarId } = req.params

    const calendar = await prisma.academicCalendar.delete({
        where: { id: calendarId }
    })

    if (!calendar) {
        throw new NotFoundError()
    }
    res.status(202).json(new AcceptedResponse())
})