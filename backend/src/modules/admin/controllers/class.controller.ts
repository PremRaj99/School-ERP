import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { CreateClassSchema, ObjectIdSchema } from '../types';
import { AdminClassService } from '../services/class.service';

export const getClasses = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const data = await AdminClassService.getClasses();
  res.status(200).json(new OkResponse(data));
});

export const createClass = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const parseData = validateSchema(CreateClassSchema, req.body);
    await AdminClassService.createClass(parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const deleteClass = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const classId = validateSchema(ObjectIdSchema, String(req.params.classId));
    await AdminClassService.deleteClass(classId);
    res.status(202).json(new AcceptedResponse());
  },
);
