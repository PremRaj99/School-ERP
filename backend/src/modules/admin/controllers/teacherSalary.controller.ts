import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import {
  CreateTeacherSalarySchema,
  monthSchema,
  ObjectIdSchema,
  teacherIdSchema,
  txnStatusSchema,
  UpdateTransactionStatusSchema,
} from '../types';
import { AdminTeacherSalaryService } from '../services/teacherSalary.service';

export const getTeacherSalaries = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters = {
      teacherId: req.query.teacherId
        ? validateSchema(teacherIdSchema, String(req.query.teacherId))
        : undefined,
      month: req.query.month ? validateSchema(monthSchema, String(req.query.month)) : undefined,
      status: req.query.status
        ? validateSchema(txnStatusSchema, String(req.query.status))
        : undefined,
    };

    const data = await AdminTeacherSalaryService.getTeacherSalaries(filters);
    res.status(200).json(new OkResponse(data));
  },
);

export const getTeacherSalaryDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const salaryId = validateSchema(ObjectIdSchema, String(req.params.salaryId));
    const data = await AdminTeacherSalaryService.getTeacherSalaryById(salaryId);
    res.status(200).json(new OkResponse(data));
  },
);

export const createTeacherSalary = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const parseData = validateSchema(CreateTeacherSalarySchema, req.body);
    await AdminTeacherSalaryService.createTeacherSalary(parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const updateTeacherSalaryStatus = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const salaryId = validateSchema(ObjectIdSchema, String(req.params.salaryId));
    const { status } = validateSchema(UpdateTransactionStatusSchema, req.body);
    await AdminTeacherSalaryService.updateTeacherSalaryStatus(salaryId, status);
    res.status(202).json(new AcceptedResponse());
  },
);

export const deleteTeacherSalary = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const salaryId = validateSchema(ObjectIdSchema, String(req.params.salaryId));
    await AdminTeacherSalaryService.deleteTeacherSalary(salaryId);
    res.status(202).json(new AcceptedResponse());
  },
);
