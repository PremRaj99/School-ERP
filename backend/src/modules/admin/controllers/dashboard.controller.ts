import { asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { AdminDashboardService } from '../services/dashboard.service';

export const getDashboard = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await AdminDashboardService.getDashboard();
    res.status(200).json(new OkResponse(data));
  },
);
