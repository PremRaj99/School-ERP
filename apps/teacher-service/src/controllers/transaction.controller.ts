import prisma from "@repo/db";
import { asyncHandler, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';

export const getTeacherSalary = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const teacherSalary = await prisma.teacherSalary.findMany({
        where: {
            teacherId: req.user?.id
        },
        include: {
            transaction: true
        }
    })

    res.status(200).json(new OkResponse(
        teacherSalary.map(t => ({
            month: t.month,
            amount: t.transaction.finalAmount,
            isPaid: t.transaction.status,
            paidAt: t.transaction.createdAt
        }))
    ))
})