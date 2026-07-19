import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, OkResponse, CreatedResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { CreateTeacherSchema, UpdateTeacherSchema } from '../types';
import { AdminTeacherService } from '../services/teacher.service';

export const getTeacher = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const data = await AdminTeacherService.getTeachers();
  res.status(200).json(new OkResponse(data));
});

export const getTeacherDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const teacherIdParam = String(req.params.teacherId);
    const teacher = await AdminTeacherService.getTeacherById(teacherIdParam);
    res.status(200).json(new OkResponse(teacher));
  },
);

export const createTeacher = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const parseData = validateSchema(CreateTeacherSchema, req.body);
    await AdminTeacherService.createTeacher(parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const updateTeacher = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const teacherIdParam = String(req.params.teacherId);
    const parseData = validateSchema(UpdateTeacherSchema, req.body);
    await AdminTeacherService.updateTeacher(teacherIdParam, parseData);
    res.status(202).json(new AcceptedResponse());
  },
);

export const deleteTeacher = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const param = String(req.params.teacherId);
    await AdminTeacherService.deleteTeacher(param);
    res.status(202).json(new AcceptedResponse());
  },
);
