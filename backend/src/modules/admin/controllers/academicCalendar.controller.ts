import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { CreatAacademicCalendarSchema, ObjectIdSchema } from '../types';
import { AdminAcademicCalendarService } from '../services/academicCalendar.service';

export const getAcademicCalendars = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await AdminAcademicCalendarService.getAcademicCalendars();
    res.status(200).json(new OkResponse(data));
  },
);

export const createAcademicCalendar = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const parseData = validateSchema(CreatAacademicCalendarSchema, req.body);
    await AdminAcademicCalendarService.createAcademicCalendar(parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const deleteAcademicCalendar = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const calendarId = validateSchema(ObjectIdSchema, String(req.params.calendarId));
    await AdminAcademicCalendarService.deleteAcademicCalendar(calendarId);
    res.status(202).json(new AcceptedResponse());
  },
);
