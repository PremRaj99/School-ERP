import { asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { TeacherService } from '../services/teacher.service';

export const getDashboard = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await TeacherService.getDashboard(req.user!.id);
    res.status(200).json(new OkResponse(data));
  },
);
