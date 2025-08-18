import prisma from "@repo/db";
import { NotFoundError } from "@repo/errorhandler";
import { timeTableFormattedData } from "@repo/helper";
import { asyncHandler, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';

export const getTimeTables = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const student = await prisma.student.findUnique({
        where: {
            userId: req.user?.id
        },
    })

    if(!student) {
        throw new NotFoundError()
    }

    const timeTable = await prisma.timeTable.findMany({
        where: {
            classId: student.classId
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