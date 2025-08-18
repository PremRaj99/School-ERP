import prisma from "@repo/db";
import { validateSchema } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { CreateClassSchema } from "@repo/types";

export const getClass = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const classes = await prisma.class.findMany();
    res.status(200).json(new OkResponse(classes))
})

export const createClass = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(CreateClassSchema, req.body);

    await prisma.class.create({
        data: {
            className: parseData.className,
            section: parseData.section,
            session: parseData.session
        }
    })

    res.status(201).json(new CreatedResponse())
})

export const deleteClass = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { classId } = req.params;

    await prisma.class.delete({
        where: { id: classId }
    })

    res.status(202).json(new AcceptedResponse())
})