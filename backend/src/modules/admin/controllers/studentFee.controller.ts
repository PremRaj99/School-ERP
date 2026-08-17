import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import {
  CreateStudentFeeSchema,
  monthSchema,
  ObjectIdSchema,
  sectionSchema,
  sessionSchema,
  classNameSchema,
  studentIdSchema,
  txnStatusSchema,
  UpdateTransactionStatusSchema,
} from '../types';
import { AdminStudentFeeService } from '../services/studentFee.service';

export const getStudentFees = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters = {
      studentId: req.query.studentId
        ? validateSchema(studentIdSchema, String(req.query.studentId))
        : undefined,
      className: req.query.className
        ? validateSchema(classNameSchema, String(req.query.className))
        : undefined,
      section: req.query.section
        ? validateSchema(sectionSchema, String(req.query.section))
        : undefined,
      session: req.query.session
        ? validateSchema(sessionSchema, String(req.query.session))
        : undefined,
      month: req.query.month ? validateSchema(monthSchema, String(req.query.month)) : undefined,
      status: req.query.status
        ? validateSchema(txnStatusSchema, String(req.query.status))
        : undefined,
    };

    const data = await AdminStudentFeeService.getStudentFees(filters);
    res.status(200).json(new OkResponse(data));
  },
);

export const getStudentFeeDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const feeId = validateSchema(ObjectIdSchema, String(req.params.feeId));
    const data = await AdminStudentFeeService.getStudentFeeById(feeId);
    res.status(200).json(new OkResponse(data));
  },
);

export const createStudentFee = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const parseData = validateSchema(CreateStudentFeeSchema, req.body);
    await AdminStudentFeeService.createStudentFee(parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const updateStudentFeeStatus = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const feeId = validateSchema(ObjectIdSchema, String(req.params.feeId));
    const { status } = validateSchema(UpdateTransactionStatusSchema, req.body);
    await AdminStudentFeeService.updateStudentFeeStatus(feeId, status);
    res.status(202).json(new AcceptedResponse());
  },
);

export const deleteStudentFee = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const feeId = validateSchema(ObjectIdSchema, String(req.params.feeId));
    await AdminStudentFeeService.deleteStudentFee(feeId);
    res.status(202).json(new AcceptedResponse());
  },
);
