import prisma from "@repo/db";
import { NotFoundError } from "@repo/errorhandler";
import { asyncHandler, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';

export const getExam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const student = await prisma.student.findUnique({
        where: {
            userId: req.user?.id
        },
    })

    if (!student) {
        throw new NotFoundError()
    }

    const exams = await prisma.exam.findMany({
        where: {
            classId: student.classId
        },
        include: {
            class: true
        }
    })

    res.status(200).json(new OkResponse(exams.map(e => ({
        id: e.id,
        dateFrom: e.dateFrom,
        dateTo: e.dateTo,
        title: e.title,
        isResultDecleared: e.isResultDecleared
    }))))
})