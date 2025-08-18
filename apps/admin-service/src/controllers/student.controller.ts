import prisma from "@repo/db";
import { DatabaseError, NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { getNewStudentSerialNumber, generateId } from "@repo/helper";
import bcrypt from 'bcrypt';
import { studentIdSchema, CreateStudentSchema, UpdateStudentSchema } from '@repo/types';

export const getStudents = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const students = await prisma.student.findMany({
        select: {
            firstName: true,
            lastName: true,
            dob: true,
            phone: true,
            rollNo: true,
            profilePhoto: true,
            studentId: true,
            class: true
        }
    });

    res.status(200).json(new OkResponse(students.map(s => ({ ...s, class: undefined, className: s.class.className, section: s.class.section, session: s.class.session }))));
})

export const getStudentDetail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const studentId = validateSchema(studentIdSchema,req.params.studentId)

    const student = await prisma.student.findUnique({
        where: { studentId }, select: {
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

export const createStudent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(CreateStudentSchema, req.body)

    const className = await prisma.class.findFirst({
        where: {
            className: parseData.className,
            section: parseData.section,
            session: parseData.session
        }
    })

    if (!className) {
        throw new NotFoundError()
    }

    const newSerialNumber = await getNewStudentSerialNumber()
    const studentId = generateId("Student", newSerialNumber)
    const hashPassword = await bcrypt.hash(studentId, 10);
    try {
        await prisma.$transaction(async (txn) => {
            const user = await prisma.user.create({
                data: {
                    username: studentId,
                    password: hashPassword,
                    role: "Student"
                }
            })

            await prisma.student.create({
                data: {
                    firstName: parseData.firstName,
                    lastName: parseData.lastName,
                    dob: parseData.dob,
                    phone: parseData.phone,
                    rollNo: parseData.rollNo,
                    serialNumber: newSerialNumber,
                    studentId: studentId,
                    address: parseData.address,
                    appId: parseData.appId,
                    classId: className.id,
                    userId: user.id,
                    dateOfAdmission: parseData.dateOfAdmission,
                    fatherAadhar: parseData.fatherAadhar,
                    fatherName: parseData.fatherName,
                    fatherOccupation: parseData.fatherOccupation,
                    motherName: parseData.motherName,
                    motherOccupation: parseData.motherOccupation,
                    motherAadhar: parseData.motherAadhar,
                    profilePhoto: parseData.profilePhoto,
                    studentAadhar: parseData.studentAadhar
                }
            })
        })

    } catch (error) {
        throw new DatabaseError()
    }

    res.status(201).json(new CreatedResponse())
})

export const updateStudent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const studentId = validateSchema(studentIdSchema,req.params.studentId)

    const parseData = validateSchema(UpdateStudentSchema, req.body)

    let className;

    if (parseData.className && parseData.section && parseData.session) {
        className = await prisma.class.findFirst({
            where: {
                className: parseData.className,
                section: parseData.section,
                session: parseData.session
            }
        })

        if (!className) {
            throw new NotFoundError()
        }
    }

    await prisma.student.update({
        where: { studentId },
        data: {
            firstName: parseData.firstName,
            lastName: parseData.lastName,
            dob: parseData.dob,
            phone: parseData.phone,
            rollNo: parseData.rollNo,
            studentId: studentId,
            address: parseData.address,
            appId: parseData.appId,
            classId: className?.id,
            dateOfAdmission: parseData.dateOfAdmission,
            fatherAadhar: parseData.fatherAadhar,
            fatherName: parseData.fatherName,
            fatherOccupation: parseData.fatherOccupation,
            motherName: parseData.motherName,
            motherOccupation: parseData.motherOccupation,
            motherAadhar: parseData.motherAadhar,
            profilePhoto: parseData.profilePhoto,
            studentAadhar: parseData.studentAadhar
        }
    })

    res.status(202).json(new AcceptedResponse())
})

export const deleteStudent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const studentId = validateSchema(studentIdSchema,req.params.studentId)

    const student = await prisma.student.delete({
        where: { studentId }
    })

    if (!student) {
        throw new NotFoundError()
    }
    res.status(202).json(new AcceptedResponse())
})