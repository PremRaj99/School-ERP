import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { CreateStudentSchema, UpdateStudentSchema } from '../types';
import { AdminStudentService } from '../services/student.service';

export const getStudent = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const data = await AdminStudentService.getStudents();
  res.status(200).json(new OkResponse(data));
});

export const getStudentDetail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const studentIdParam = String(req.params.studentId);
    const data = await AdminStudentService.getStudentById(studentIdParam);
    res.status(200).json(new OkResponse(data));
  },
);

export const createStudent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(CreateStudentSchema, req.body);
    await AdminStudentService.createStudent(parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const updateStudent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const studentIdParam = String(req.params.studentId);
    const parseData = validateSchema(UpdateStudentSchema, req.body);
    await AdminStudentService.updateStudent(studentIdParam, parseData);
    res.status(202).json(new AcceptedResponse());
  },
);

export const deleteStudent = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const param = String(req.params.studentId);
    await AdminStudentService.deleteStudent(param);
    res.status(202).json(new AcceptedResponse());
  },
);
