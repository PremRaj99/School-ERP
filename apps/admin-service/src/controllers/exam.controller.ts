import prisma from "@repo/db";
import { DatabaseError, NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { storeExamData } from "@repo/helper";
import { CreateExamSchema } from "@repo/types";

export const getExam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const exams = await prisma.exam.findMany({
        select: {
            class: true,
            dateFrom: true,
            dateTo: true,
            title: true,
            isResultDecleared: true,
            id: true
        }
    })

    res.status(200).json(new OkResponse(exams.map(e => ({
        ...e,
        class: undefined,
        className: e.class.className,
        section: e.class.section,
    }))))
})

export const createExam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const parseData = validateSchema(CreateExamSchema, req.body)

    try {
        await storeExamData(parseData)
    } catch (error) {
        throw new DatabaseError()
    }

    res.status(201).json(new CreatedResponse())
})

export const deleteExam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { examId } = req.params

    const exam = await prisma.exam.delete({
        where: { id: examId }
    })

    if (!exam) {
        throw new NotFoundError()
    }
    res.status(202).json(new AcceptedResponse())
})