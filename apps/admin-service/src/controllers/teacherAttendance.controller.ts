import prisma from "@repo/db";
import { DatabaseError, NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { dateSchema } from "../types/teacherSchema";
import { CreateTeacherAttendanceSchema, UpdateTeacherAttendanceSchema } from "../types/teacherAttendanceSchema";

export const getTeacherAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const date = validateSchema(dateSchema, req.query.date);

    if (typeof date !== "string" || !date) {
        throw new NotFoundError("Date not found");
    }

    const formattedDate = new Date(date);

    const teacherAttendance = await prisma.teacherAttendance.findMany({
        where: {
            date: formattedDate
        },
        select: {
            status: true,
            teacher: {
                select: {
                    firstName: true,
                    lastName: true,
                    teacherId: true,
                }
            },
            id: true,
        }
    })

    res.status(200).json(new OkResponse({ date: date, teachers: teacherAttendance.map(a => ({ ...a, teacher: undefined, firstName: a.teacher.firstName, lastName: a.teacher.lastName, teacherId: a.teacher.teacherId })) }))
})

export const createTeacherAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const date = validateSchema(dateSchema, req.query.date);

    if (typeof date !== "string" || !date) {
        throw new NotFoundError("Date not found");
    }

    const formattedDate = new Date(date);

    const parseData = validateSchema(CreateTeacherAttendanceSchema, req.body)

    const teacherIds = await Promise.all(
        parseData.map(async d => {
            const teacher = await prisma.teacher.findUnique({ where: { teacherId: d.teacherId }, select: { id: true } });
            if (!teacher) {
                throw new NotFoundError("TeacherId not found")
            }
            return teacher.id ?? null;
        })
    );

    const attendanceData = parseData.map((d, i) => ({
        date: formattedDate,
        status: d.status,
        teacherId: teacherIds[i] as string
    })).filter(a => a.teacherId);

    await prisma.teacherAttendance.createMany({
        data: attendanceData
    });


    res.status(201).json(new CreatedResponse())
})

export const updateTeacherAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const parseData = validateSchema(UpdateTeacherAttendanceSchema, req.body)

    const updatePromises = parseData.map(d =>
        prisma.teacherAttendance.update({
            where: {
                id: d.id,
            },
            data: {
                status: d.status,
            },
        })
    );

    // Execute all update promises in a single transaction
    try {
        await prisma.$transaction(updatePromises);
    } catch (error) {
        throw new DatabaseError()
    }

    res.status(202).json(new OkResponse())
})