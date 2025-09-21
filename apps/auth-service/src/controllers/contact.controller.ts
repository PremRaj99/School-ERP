import prisma from "@repo/db";

import { validateSchema } from "@repo/errorhandler";
import { asyncHandler, CreatedResponse } from "@repo/responsehandler";
import { NextFunction, Request, Response } from 'express';
import { ContactUsSchema } from "@repo/types";

export const submitContact = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(ContactUsSchema, req.body)

    await prisma.contact.create({
        data: {
            email: parseData.email,
            message: parseData.message,
            name: parseData.name,
            mobile: parseData.mobile
        }
    })

    res.status(201).json(new CreatedResponse());
})