import { asyncHandler, OkResponse } from "@/core/responses";
import { NextFunction, Request, Response } from 'express';
import { StudentService } from "../services/student.service";

export const getTimeTables = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const data = await StudentService.getTimetables(req.user!.id);
    res.status(200).json(new OkResponse(data));
});
