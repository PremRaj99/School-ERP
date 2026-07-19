import { asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { TeacherService } from '../services/teacher.service';

export const getTeacher = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const data = await TeacherService.getTeacherProfile(req.user!.id);
  res.status(200).json(new OkResponse(data));
});
