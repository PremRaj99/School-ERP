import { validateSchema } from "@/core/errors";
import { asyncHandler, CreatedResponse } from "@/core/responses";
import { NextFunction, Request, Response } from "express";
import { ContactUsSchema } from "./types";
import { ContactService } from "./services/contact.service";

export const submitContact = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(ContactUsSchema, req.body);
    await ContactService.createContact(parseData);
    res.status(201).json(new CreatedResponse());
});
