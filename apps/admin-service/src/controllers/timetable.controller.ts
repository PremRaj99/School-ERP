import prisma from "@repo/db";
import { NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { getCurrentSessionYear } from "../helpers/getCurrentSessionYear";
import { timeTableFormattedData } from "../helpers/timeTableFormattedData";
import { UpdateTimeTableSchema } from "../types/timeTableSchema";

export const getTimeTables = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const currentSessionYear = getCurrentSessionYear()

    const timeTable = await prisma.timeTable.findMany({
        where: {
            class: {
                session: currentSessionYear
            }
        },
        select: {
            class: {
                select: {
                    className: true,
                    section: true,
                }
            },
            teacher: {
                select: {
                    teacherId: true,
                    firstName: true,
                    lastName: true,
                }
            },
            weekday: true,
            subject: {
                select: {
                    subjectName: true,
                    subjectCode: true
                }
            },
            period: true
        }
    })

    const data = timeTableFormattedData(timeTable)
    res.status(200).json(new OkResponse(data))
})

export const updateTimeTable = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(UpdateTimeTableSchema, req.body);
    const currentSessionYear = getCurrentSessionYear()

    const className = await prisma.class.findFirst({
        where: {
            className: parseData.className,
            section: parseData.section,
            session: currentSessionYear
        }
    })

    if (!className) {
        throw new NotFoundError()
    }

    let subject;

    if (parseData.subjectCode) {
        subject = await prisma.subject.findUnique({ where: { subjectCode: parseData.subjectCode } })
    }

    let teacher;

    if (parseData.teacherId) {
        teacher = await prisma.teacher.findUnique({
            where: { teacherId: parseData.teacherId }
        })
    }

    const timetable = await prisma.timeTable.update({
        where: {
            classId_weekday_period: {
                classId: className.id,
                weekday: parseData.weekday,
                period: parseData.period
            }
        },
        data: {
            teacherId: teacher?.id,
            subjectId: subject?.id
        }
    })

    if (!timetable) {
        if (!subject || !teacher) {
            throw new NotFoundError()
        }

        await prisma.timeTable.create({
            data: {
                period: parseData.period,
                weekday: parseData.weekday,
                classId: className.id,
                subjectId: subject.id,
                teacherId: teacher.id
            }
        })
    }

    res.status(202).json(new AcceptedResponse())
})