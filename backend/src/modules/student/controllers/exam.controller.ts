import { asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { StudentService } from '../services/student.service';

export const getExams = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const data = await StudentService.getExams(req.user!.id);
  res.status(200).json(new OkResponse(data));
});
