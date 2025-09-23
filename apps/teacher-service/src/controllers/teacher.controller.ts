import prisma from "@repo/db";
import { NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, OkResponse } from "@repo/responsehandler";
import { aboutSchema } from "@repo/types";
import { NextFunction, Request, Response } from 'express';

export const getTeacherProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const teacher = await prisma.teacher.findUnique({
        where: {
            id: req.user?.id
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

export const updateAbout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const about = validateSchema(aboutSchema, req.body.about)

    try {
        await prisma.teacher.update({
            where: {
                id: req.user?.id
            },
            data: {
                about: about
            }
        })
    } catch (error) {
        throw new NotFoundError()
    }

    res.status(202).json(new AcceptedResponse())
})