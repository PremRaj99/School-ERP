import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import {
  CreateTeacherAttendanceSchema,
  dateSchema,
  monthSchema,
  teacherIdSchema,
  UpdateTeacherAttendanceSchema,
} from '../types';
import { AdminTeacherAttendanceService } from '../services/teacherAttendance.service';

export const getTeacherAttendanceForDate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const date = validateSchema(dateSchema, String(req.query.date));
    const data = await AdminTeacherAttendanceService.getTeacherAttendanceByDate(date);
    res.status(200).json(new OkResponse(data));
  },
);

export const getTeacherAttendanceForMonth = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const teacherId = validateSchema(teacherIdSchema, String(req.params.teacherId));
    const month = validateSchema(monthSchema, String(req.query.month));
    const data = await AdminTeacherAttendanceService.getTeacherAttendanceByMonth(teacherId, month);
    res.status(200).json(new OkResponse(data));
  },
);

export const markTeacherAttendanceForDate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const date = validateSchema(dateSchema, String(req.query.date));
    const parseData = validateSchema(CreateTeacherAttendanceSchema, req.body);
    await AdminTeacherAttendanceService.markTeacherAttendance(date, parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const updateTeacherAttendanceForDate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(UpdateTeacherAttendanceSchema, req.body);
    await AdminTeacherAttendanceService.updateTeacherAttendance(parseData);
    res.status(202).json(new AcceptedResponse());
  },
);
