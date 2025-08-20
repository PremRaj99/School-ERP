import prisma from "@repo/db";
import { NotFoundError, validateSchema, ValidationError } from "@repo/errorhandler";
import { getDateString } from "@repo/helper";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { CreatAacademicCalendarSchema, ObjectIdSchema } from "@repo/types";
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

export const createAcademicCalender = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const parseData = validateSchema(CreatAacademicCalendarSchema, req.body)

    try {
        await prisma.academicCalendar.create({
            data: {
                date: getDateString(parseData.date),
                title: parseData.title,
                category: parseData.category
            }
        })
    } catch (error) {
        throw new ValidationError("already exist")
    }
    res.status(201).json(new CreatedResponse())
})

export const deleteAcademicCalendar = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const calendarId = validateSchema(ObjectIdSchema, req.params.calendarId)

    try {
        await prisma.academicCalendar.delete({
            where: { id: calendarId }
        })
    } catch (e) {
        throw new NotFoundError()
    }

    res.status(202).json(new AcceptedResponse())
})