import prisma from "@repo/db";
import { NotFoundError } from "@repo/errorhandler";
import { asyncHandler, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';

export const getResult = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { examId } = req.params;

    const student = await prisma.student.findUnique({
        where: {
            userId: req.user?.id
        },
    })

    if (!student) {
        throw new NotFoundError()
    }

    const examWithResults = await prisma.exam.findUnique({
        where: {
            id: examId,
            classId: student.classId,
            isResultDecleared: true
        },
        select: {
            id: true,
            title: true,
            dateFrom: true,
            dateTo: true,
            class: { // Navigate from Exam -> Class
                select: {
                    className: true,
                    section: true,
                    students: { // Navigate from Class -> Students
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            rollNo: true,
                            examResults: { // For each student, get their results
                                // CRITICAL: Filter results for the current exam ONLY
                                where: {
                                    examSubject: {
                                        examId: examId,
                                    },
                                },
                                select: {
                                    marksObtained: true,
                                    grade: true,
                                    remark: true,
                                    examSubject: { // Get subject details for each result
                                        select: {
                                            date: true,
                                            fullMarks: true,
                                            subject: {
                                                select: {
                                                    subjectCode: true,
                                                    subjectName: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!examWithResults) {
        throw new NotFoundError()
    }

    res.status(200).json(new OkResponse({
        id: examWithResults.id,
        dateFrom: examWithResults.dateFrom,
        dateTo: examWithResults.dateTo,
        title: examWithResults.title,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        className: examWithResults.class.className,
        section: examWithResults.class.section,
        rollNo: student.rollNo,
        marks: examWithResults.class.students.filter(s => s.id === student.id)[0].examResults.map(r => ({
            subjectCode: r.examSubject.subject.subjectCode,
            subjectName: r.examSubject.subject.subjectName,
            date: r.examSubject.date,
            marksObtained: r.marksObtained,
            fullMarks: r.examSubject.fullMarks,
            grade: r.grade,
            remark: r.remark
        }))
    }))
})