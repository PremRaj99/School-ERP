import prisma from "@repo/db";
import { DatabaseError, NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { CreateTeacherSchema, ObjectIdSchema, UpdateTeacherSchema, teacherIdSchema } from "@repo/types";
import { getNewTeacherSerialNumber, generateId, getDateString } from "@repo/helper";

import bcrypt from 'bcrypt';

export const getTeachers = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const teachers = await prisma.teacher.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            subjectHandled: true,
            profilePhoto: true,
            teacherId: true
        }
    })

    res.status(200).json(new OkResponse(teachers))
})

export const getTeacherDetail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = validateSchema(ObjectIdSchema, req.params.teacherId);

    const teacher = await prisma.teacher.findUnique({
        where: {
            id: teacherId
        }
    })

    if (!teacher) {
        throw new NotFoundError()
    }

    res.status(200).json(new OkResponse({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        dob: teacher.dob,
        address: teacher.address,
        phone: teacher.phone,
        teacherAadhar: teacher.teacherAadhar,
        dateOfJoining: teacher.dateOfJoining,
        about: teacher.about,
        salaryPerMonth: teacher.salaryPerMonth,
        qualifications: teacher.qualifications,
        subjectsHandled: teacher.subjectHandled,
        profilePhoto: teacher.profilePhoto,
        teacherId: teacher.teacherId
    }))

})

export const createTeacher = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(CreateTeacherSchema, req.body)

    const newSerialNumber = await getNewTeacherSerialNumber();
    const teacherId = generateId("Teacher", newSerialNumber);

    const hashPassword = await bcrypt.hash(teacherId, 10);

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create the User first and await its result
            const newUser = await tx.user.create({
                data: {
                    username: teacherId,
                    role: "Teacher",
                    password: hashPassword,
                }
            });

            // 2. Now you can use newUser.id to create the Teacher
            const teacher = await tx.teacher.create({
                data: {
                    firstName: parseData.firstName,
                    lastName: parseData.lastName,
                    dob: getDateString(parseData.dob),
                    dateOfJoining: getDateString(parseData.dateOfJoining),
                    phone: parseData.phone,
                    salaryPerMonth: parseData.salaryPerMonth,
                    teacherId: teacherId,
                    serialNumber: newSerialNumber,
                    about: parseData.about,
                    address: parseData.address,
                    profilePhoto: parseData.profilePhoto,
                    qualifications: parseData.qualifications,
                    teacherAadhar: parseData.teacherAadhar,
                    userId: newUser.id
                }
            });
        });

    } catch (error) {
        throw new DatabaseError()
    }

    res.status(201).json(new CreatedResponse())
})

export const updateTeacher = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = validateSchema(ObjectIdSchema, req.params.teacherId);

    const parseData = validateSchema(UpdateTeacherSchema, req.body)
    const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } })

    if (!teacher) {
        throw new NotFoundError("Teacher not Found")
    }

    await prisma.teacher.update({
        where: { id: teacherId },
        data: {
            about: parseData.about,
            address: parseData.address,
            dateOfJoining: parseData.dateOfJoining ? getDateString(parseData.dateOfJoining) : undefined,
            dob: parseData.dob ? getDateString(parseData.dob) : undefined,
            firstName: parseData.firstName,
            lastName: parseData.lastName,
            phone: parseData.phone,
            profilePhoto: parseData.profilePhoto,
            qualifications: parseData.qualifications,
            salaryPerMonth: parseData.salaryPerMonth,
            subjectHandled: parseData.subjectsHandled,
            teacherAadhar: parseData.teacherAadhar,
        }
    })

    res.status(202).json(new AcceptedResponse())
})

export const deleteTeacher = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = validateSchema(ObjectIdSchema, req.params.teacherId);

    try {
        await prisma.teacher.delete({
            where: { id: teacherId }
        })
    } catch (e) {
        throw new NotFoundError()
    }
    res.status(202).json(new AcceptedResponse())
})