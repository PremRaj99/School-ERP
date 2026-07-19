import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { UpdateTimeTableSchema } from '../types';
import { AdminTimetableService } from '../services/timetable.service';

export const getTimeTables = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await AdminTimetableService.getTimeTables();
    res.status(200).json(new OkResponse(data));
  },
);

export const updateTimeTable = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const parseData = validateSchema(UpdateTimeTableSchema, req.body);
    await AdminTimetableService.updateTimeTable(parseData);
    res.status(202).json(new AcceptedResponse());
  },
);
