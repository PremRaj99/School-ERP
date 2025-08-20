import prisma from "@repo/db";
import { NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { CreateNoticeSchema, ObjectIdSchema } from "@repo/types";

export const getNotices = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const notices = await prisma.notice.findMany({
        where: {
            targetRole: "Teacher"
        },
        select: {
            id: true,
            date: true,
            title: true,
            targetRole: true
        }
    })
    res.status(200).json(new OkResponse(notices))
})

export const getNoticeDetail = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const noticeId = validateSchema(ObjectIdSchema, req.params.noticeId)

    const notice = await prisma.notice.findUnique({
        where: {
            id: noticeId,
            targetRole: "Teacher"
        }
    });

    if(!notice) {
        throw new NotFoundError()
    }

    res.status(200).json(new OkResponse(notice))
})