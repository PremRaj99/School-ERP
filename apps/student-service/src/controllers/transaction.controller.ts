import prisma from "@repo/db";
import { asyncHandler, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { NotFoundError, validateSchema } from '@repo/errorhandler';
import { sessionSchema } from "@repo/types";

export const getStudentFee = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const sessionYear = validateSchema(sessionSchema, req.query.year)

    const studentFees = await prisma.studentFee.findMany({
        where: {
            studentId: req.user?.id,
            student: {
                class: {
                    session: sessionYear
                }
            }
        },
        include: {
            transaction: true
        }
    })

    res.status(200).json(new OkResponse(
        studentFees.map(t => ({
            id: t.id,
            month: t.month,
            finalAmount: t.transaction.finalAmount,
            isPaid: t.transaction.status,
            paidAt: t.transaction.createdAt
        }))
    ))
})

export const getStudentFeeDetail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const { feeId } = req.params;

    const studentFee = await prisma.studentFee.findUnique({
        where: {
            studentId: req.user?.id,
            id: feeId
        },
        include: {
            transaction: true,
            feeBreakdown: true,
            student: {
                include: {
                    class: true
                }
            },

        }
    })

    if (!studentFee) {
        throw new NotFoundError()
    }

    res.status(200).json(new OkResponse(
        {
            id: studentFee.id,
            firstName: studentFee.student.firstName,
            lastName: studentFee.student.lastName,
            className: studentFee.student.class.className,
            section: studentFee.student.class.section,
            rollNo: studentFee.student.rollNo,
            month: studentFee.month,
            session: studentFee.student.class.session,
            beakDown: studentFee.feeBreakdown.map(b => ({
                feeType: b.feeType,
                amount: b.amount,
            })),
            finalAmount: studentFee.transaction.finalAmount,
            isPaid: studentFee.transaction.status,
            paidAt: studentFee.transaction.createdAt
        }
    ))
})