import { asyncHandler, OkResponse } from "@/core/responses";
import { NextFunction, Request, Response } from 'express';
import { StudentService } from "../services/student.service";

export const getAcademicCalendars = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const data = await StudentService.getAcademicCalendar();
    res.status(200).json(new OkResponse(data));
});
