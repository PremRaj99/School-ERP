import prisma from "@repo/db";
import { NotFoundError, validateSchema } from "@repo/errorhandler";
import { asyncHandler, OkResponse } from "@repo/responsehandler";
import { ObjectIdSchema } from "@repo/types";
import { NextFunction, Request, Response } from 'express';

export const getExam = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const exams = await prisma.exam.findMany({
        include: {
            class: true
        }
    })

    res.status(200).json(new OkResponse(exams.map(e => ({
        id: e.id,
        className: e.class.className,
        section: e.class.section,
        dateFrom: e.dateFrom,
        dateTo: e.dateTo,
        title: e.title,
        isResultDecleared: e.isResultDecleared
    }))))
})

export const getExamSubject = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const examId = validateSchema(ObjectIdSchema, req.params.examId);
    const exam = await prisma.exam.findUnique({
        where: {
            id: examId
        },
        include: {
            class: true,
            examSubjects: {
                include: {
                    subject: true
                }
            },
        }
    })

    if (!exam) {
        throw new NotFoundError()
    }

    res.status(200).json(new OkResponse({
        id: exam.id,
        className: exam.class.className,
        section: exam.class.section,
        dateFrom: exam.dateFrom,
        dateTo: exam.dateTo,
        title: exam.title,
        isResultDecleared: exam.isResultDecleared,
        subjects: exam.examSubjects.map(s => ({
            id: s.id,
            subjectName: s.subject.subjectName,
            subjectCode: s.subject.subjectCode,
            date: s.date,
            fullMarks: s.fullMarks,
            isMarked: s.isMarked
        }))
    }))
})

