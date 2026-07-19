import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { CreateSubjectSchema, subjectCodeSchema, UpdateSubjectSchema } from '../types';
import { AdminSubjectService } from '../services/subject.service';

export const getAllClassSubjects = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await AdminSubjectService.getAllClassSubjects();
    res.status(200).json(new OkResponse(data));
  },
);

export const createSubject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(CreateSubjectSchema, req.body);
    await AdminSubjectService.createSubject(parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const updateSubject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const subjectCode = validateSchema(subjectCodeSchema, String(req.params.subjectCode));
    const parseData = validateSchema(UpdateSubjectSchema, req.body);
    await AdminSubjectService.updateSubject(subjectCode, parseData);
    res.status(202).json(new AcceptedResponse());
  },
);

export const deleteSubject = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const subjectCode = validateSchema(subjectCodeSchema, String(req.params.subjectCode));
    await AdminSubjectService.deleteSubject(subjectCode);
    res.status(202).json(new AcceptedResponse());
  },
);
