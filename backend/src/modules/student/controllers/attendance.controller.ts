import { validateSchema } from "@/core/errors";
import { asyncHandler, OkResponse } from "@/core/responses";
import { NextFunction, Request, Response } from 'express';
import { monthSchema } from "../types";
import { StudentService } from "../services/student.service";

export const getAttendance = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const month = validateSchema(monthSchema, String(req.query.month));
    const data = await StudentService.getAttendance(req.user!.id, month);
    res.status(200).json(new OkResponse(data));
});
