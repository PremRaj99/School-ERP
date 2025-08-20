import prisma from "@repo/db";
import { NotFoundError, validateSchema, ValidationError } from "@repo/errorhandler";
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { CreateClassSchema, ObjectIdSchema } from "@repo/types";

export const getClass = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const classes = await prisma.class.findMany();
    res.status(200).json(new OkResponse(classes))
})

export const createClass = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(CreateClassSchema, req.body);

    const existingClass = await prisma.class.findUnique({
        where: {
            className_section_session: {
                className: parseData.className,
                section: parseData.section,
                session: parseData.session
            }
        }
    });

    if (existingClass) {
        throw new ValidationError("already exist")
    }

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
    const classId = validateSchema(ObjectIdSchema, req.params.classId);

    try {
        await prisma.class.delete({
            where: { id: classId }
        })
    } catch (error) {
        throw new NotFoundError()
    }

    res.status(202).json(new AcceptedResponse())
})