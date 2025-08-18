import prisma from '@repo/db';
import { NotFoundError } from '@repo/errorhandler';
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