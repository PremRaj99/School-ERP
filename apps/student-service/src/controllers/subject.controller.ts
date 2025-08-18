import prisma from "@repo/db";
import { NotFoundError } from "@repo/errorhandler";
import { asyncHandler, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';


export const getAllSubjects = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {


    const student = await prisma.student.findUnique({
        where: { userId: req.user?.id }
    })

    if (!student) {
        throw new NotFoundError()
    }

    const timeTable = await prisma.timeTable.findMany({
        where: {
            classId: student.classId
        },
        select: {
            class: {
                select: {
                    className: true
                }
            },
            subject: {
                select: {
                    subjectCode: true,
                    subjectName: true
                }
            },
            teacher: {
                select: {
                    firstName: true,
                    lastName: true,
                }
            }
        }
    })

    res.status(200).json(new OkResponse(timeTable))

})