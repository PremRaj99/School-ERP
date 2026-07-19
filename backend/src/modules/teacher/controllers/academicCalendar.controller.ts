import { asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { TeacherService } from '../services/teacher.service';

export const getAcademicCalendars = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await TeacherService.getAcademicCalendar();
    res.status(200).json(new OkResponse(data));
  },
);
