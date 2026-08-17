import { asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { StudentService } from '../services/student.service';

export const getDashboard = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await StudentService.getDashboard(req.user!.id);
    res.status(200).json(new OkResponse(data));
  },
);
