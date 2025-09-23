import prisma from "@repo/db";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { validateSchema } from "@repo/errorhandler";
import { CreateClassAttendanceSchema, monthSchema, ObjectIdSchema } from "@repo/types";
import { getDateString, getMonthStartEnd } from "@repo/helper";
import { DatabaseError, NotFoundError } from "@repo/errorhandler";
import { getCurrentSessionYear } from '@repo/helper';
import { UpdateClassAttendanceSchema } from "@repo/types";

export const getTeacherAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const monthString = validateSchema(monthSchema, req.query.month)

    const { endDate, startDate } = getMonthStartEnd(monthString)

    const teacherAttendance = await prisma.teacherAttendance.findMany({
        where: {
            date: {
                gte: startDate,
                lt: endDate,
            },
            teacherId: req.user?.id
        }
    })

    res.status(200).json(new OkResponse(
        teacherAttendance.map(t => ({
            date: t.date,
            status: t.status
        }))
    ))
})

export const getClassAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const monthString = validateSchema(monthSchema, req.query.month)

    const { endDate, startDate } = getMonthStartEnd(monthString)

    const classAttendance = await prisma.classAttendance.findMany({
        where: {
            date: {
                gte: startDate,
                lt: endDate
            }
        },
        include: {
            class: true
        }
    })

    res.status(200).json(new OkResponse(
        classAttendance.map(a => ({
            id: a.id,
            date: a.date,
            className: a.class.className,
            section: a.class.section,
            isMarked: a.isMarked
        }))
    ))
})

export const getClassAttendanceDetail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const classAttendanceId = validateSchema(ObjectIdSchema, req.params.classAttendanceId);

    const classAttendance = await prisma.classAttendance.findUnique({
        where: { id: classAttendanceId },
        include: {
            class: {
                include: {
                    students: true, // Eager load all students for the class
                }
            }
        }
    });


    if (!classAttendance) {
        throw new NotFoundError('Class attendance record not found.');
    }

    const studentIds = classAttendance.class.students.map(s => s.id);
    const attendanceDate = classAttendance.date;

    const studentAttendances = await prisma.studentAttendance.findMany({
        where: {
            studentId: {
                in: studentIds, // Filter by student IDs from the class
            },
            date: attendanceDate, // **Crucially, filter by the specific date**
        }
    });

    const attendanceStatusMap = new Map(
        studentAttendances.map(sa => [sa.studentId, { status: sa.status, id: sa.id }])
    );

    const studentsWithStatus = classAttendance.class.students.map(student => ({
        id: attendanceStatusMap.get(student.id)?.id,
        rollNo: student.rollNo,
        firstName: student.firstName,
        lastName: student.lastName,
        studentId: student.id, // This is the unique identifier like 'MAC002'
        // Look up the status from the map. Default to 'Unmarked' if not found.
        status: attendanceStatusMap.get(student.id)?.status || 'Unmarked'
    }));

    res.status(200).json(new OkResponse(
        {
            id: classAttendance.id,
            date: classAttendance.date,
            className: classAttendance.class.className,
            section: classAttendance.class.section,
            isMarked: classAttendance.isMarked,
            students: studentsWithStatus
        }
    ))
})

export const createClassAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const parseData = validateSchema(CreateClassAttendanceSchema, req.body)
    const currentSession = getCurrentSessionYear()

    const className = await prisma.class.findUnique({
        where: {
            className_section_session: {
                className: parseData.className,
                section: parseData.section,
                session: currentSession
            }
        }
    })

    if (!className) {
        throw new NotFoundError()
    }

    try {
        await prisma.$transaction(async (txn) => {
            await txn.classAttendance.create({
                data: {
                    date: getDateString(parseData.date),
                    isMarked: true,
                    classId: className.id,
                }
            })

            await txn.studentAttendance.createMany({
                data: parseData.attendance.map(a => ({
                    studentId: a.studentId,
                    status: a.status,
                    date: getDateString(parseData.date)
                }))
            })
        })
    } catch (e) {
        console.error(e)
        throw new DatabaseError()
    }

    res.status(201).json(new CreatedResponse())
})

export const updateClassAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(UpdateClassAttendanceSchema, req.body);

    try {
        await prisma.$transaction(async (txn) => {

            await Promise.all(parseData.map(async (data) => {

                const studentAttendance = await txn.studentAttendance.update({
                    where: {
                        id: data.id,
                        studentId: data.studentId
                    },
                    data: {
                        status: data.status
                    }
                })
                if (!studentAttendance) {
                    throw new NotFoundError()
                }
            }))
        })
    } catch (e) {
        throw new DatabaseError()
    }

    res.status(202).json(new AcceptedResponse())
})

