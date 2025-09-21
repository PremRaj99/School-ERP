import prisma from '@repo/db';
import { NotFoundError } from '@repo/errorhandler';
import { timeTableFormattedData } from '@repo/helper';
import { asyncHandler, OkResponse } from '@repo/responsehandler';
import { NextFunction, Request, Response } from 'express';
export const getStudent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const student = await prisma.student.findUnique({
        where: { userId: req.user?.id }, select: {
            firstName: true,
            lastName: true,
            dob: true,
            address: true,
            phone: true,
            fatherName: true,
            motherName: true,
            fatherOccupation: true,
            motherOccupation: true,
            studentAadhar: true,
            fatherAadhar: true,
            dateOfAdmission: true,
            class: true,
            rollNo: true,
            appId: true,
            profilePhoto: true,
            studentId: true
        }
    })

    if (!student) {
        throw new NotFoundError()
    }

    res.status(200).json(new OkResponse({ ...student, class: undefined, className: student.class.className, session: student.class.session, section: student.class.section }))
})
export const getDashboard = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    // student Data
    const student = await prisma.student.findUnique({
        where: { userId: req.user?.id }, select: {
            firstName: true,
            lastName: true,
            class: true,
            rollNo: true,
            profilePhoto: true,
            studentId: true
        }
    })
    if (!student) {
        throw new NotFoundError()
    }
    
    const studentData = {
        ...student,
        class: undefined,
        className: student.class.className,
        session: student.class.session,
        section: student.class.section
    }

    // notice data

    const notices = await prisma.notice.findMany({
        where: {
            targetRole: "Student"
        },
        select: {
            id: true,
            date: true,
            title: true,
            targetRole: true
        }
    })

    // exam data

    const exams = await prisma.exam.findMany({
        where: {
            classId: student.class.id
        },
        include: {
            class: true
        }
    })

    const examData = exams.map(e => ({
        id: e.id,
        dateFrom: e.dateFrom,
        dateTo: e.dateTo,
        title: e.title,
        isResultDecleared: e.isResultDecleared
    }))

    // time table data

    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const todayWeekday = weekdays[new Date().getDay()];

    const timeTable = await prisma.timeTable.findMany({
        where: {
            classId: student.class.id,
            weekday: todayWeekday as 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'
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

    const timeTabledata = timeTableFormattedData(timeTable)

    res.status(200).json(new OkResponse({
        student: studentData,
        notice: notices,
        exam: examData,
        timeTable: timeTabledata
    }))
})