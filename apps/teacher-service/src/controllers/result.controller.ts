import prisma from "@repo/db";
import { DatabaseError, NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { CreateResultSchema, ObjectIdSchema, UpdateResultSchema } from "@repo/types";
import { NextFunction, Request, Response } from 'express';
import { getCurrentSessionYear } from '../../../../packages/helper/src/helpers/getCurrentSessionYear';
import { getGrade } from "@repo/helper";

export const getResult = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const examId = validateSchema(ObjectIdSchema, req.params.examId)
    const subjectId = validateSchema(ObjectIdSchema, req.params.subjectId)

    const examSubject = await prisma.examSubject.findFirst({
        where: {
            examId: examId,
            subjectId: subjectId,
        },
        include: {
            exam: { // Include the parent Exam
                include: {
                    class: true, // And the class the exam belongs to
                },
            },
            subject: true, // Include the subject details
            examResults: { // Include all results for this exam subject
                include: {
                    student: true, // And the student for each result
                },
                orderBy: {
                    student: {
                        rollNo: 'asc' // Optional: sort results by roll number
                    }
                }
            },
        },
    });

    if (!examSubject) {
        throw new NotFoundError('Result for the specified exam and subject not found.');
    }

    const formattedResult = {
        id: examSubject.exam.id,
        dateFrom: examSubject.exam.dateFrom,
        dateTo: examSubject.exam.dateTo,
        title: examSubject.exam.title,
        className: examSubject.exam.class.className,
        section: examSubject.exam.class.section,
        subjectCode: examSubject.subject.subjectCode,
        subjectName: examSubject.subject.subjectName,
        fullMarks: examSubject.fullMarks,
        isMarked: examSubject.isMarked,
        marks: examSubject.examResults.map((result) => ({
            id: result.id,
            studentId: result.studentId,
            firstName: result.student.firstName,
            lastName: result.student.lastName,
            date: examSubject.date, // The date of this specific subject exam
            rollNo: result.student.rollNo,
            marksObtained: result.marksObtained,
            grade: result.grade,
            remark: result.remark,
        })),
    };

    res.status(200).json(new OkResponse(formattedResult))
})

export const createResult = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const examId = validateSchema(ObjectIdSchema, req.params.examId)
    const subjectId = validateSchema(ObjectIdSchema, req.params.subjectId)
    const parseData = validateSchema(CreateResultSchema, req.body)

    try {
        await prisma.$transaction(async (txn) => {
            const examSubject = await txn.examSubject.update({
                where: {
                    examId_subjectId: {
                        examId,
                        subjectId
                    },
                    teacherId: req.user?.id
                },
                data: {
                    isMarked: true
                }
            })

            if (!examSubject) {
                throw new NotFoundError()
            }

            await txn.examResult.createMany({
                data: parseData.map((d) => ({
                    subjectId,
                    examSubjectId: examSubject.id,
                    studentId: d.studentId,
                    marksObtained: d.marksObtained,
                    grade: getGrade(examSubject.fullMarks, d.marksObtained),
                    remark: d.remark
                }))
            })
        })
    } catch (error) {
        throw new DatabaseError()
    }

    res.status(201).json(new CreatedResponse())
})

export const updateResult = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const examId = validateSchema(ObjectIdSchema, req.params.examId)
    const subjectId = validateSchema(ObjectIdSchema, req.params.subjectId)
    const parseData = validateSchema(UpdateResultSchema, req.body)

    const examSubject = await prisma.examSubject.findUnique({
        where: {
            examId_subjectId: {
                examId,
                subjectId
            }
        }
    })

    if (!examSubject) {
        throw new NotFoundError()
    }

    try {
        await prisma.$transaction(async (txn) => {
            await Promise.all(parseData.map(async data => {
                await txn.examResult.update({
                    where: {
                        examSubjectId_studentId: {
                            examSubjectId: examSubject.id,
                            studentId: data.studentId
                        }
                    },
                    data: {
                        marksObtained: data.marksObtained,
                        grade: getGrade(examSubject.fullMarks, data.marksObtained),
                        remark: data.remark
                    }
                })
            }))
        })
    } catch (error) {
        throw new DatabaseError()
    }

    res.status(202).json(new AcceptedResponse())
})

