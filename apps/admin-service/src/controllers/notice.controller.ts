import prisma from "@repo/db";
import { NotFoundError, validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { CreateNoticeSchema, ObjectIdSchema } from "@repo/types";
import { getDateString } from "@repo/helper";

export const getNotices = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const notices = await prisma.notice.findMany({
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
        where: { id: noticeId }
    });

    if (!notice) {
        throw new NotFoundError()
    }

    res.status(200).json(new OkResponse(notice))
})

export const createNotice = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(CreateNoticeSchema, req.body)

    await prisma.notice.create({
        data: {
            targetRole: parseData.targetRole,
            date: getDateString(parseData.date),
            title: parseData.title,
            description: parseData.description,
            fileUrl: parseData.fileUrl,
            expiryDate: parseData.expiryDate ? getDateString(parseData.expiryDate) : undefined
        }
    });

    res.status(201).json(new CreatedResponse())
})

export const deleteNotice = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const noticeId = validateSchema(ObjectIdSchema, req.params.noticeId)

    try {
        await prisma.notice.delete({
            where: { id: noticeId }
        });
    } catch (e) {
        throw new NotFoundError()
    }


    res.status(202).json(new AcceptedResponse())
})