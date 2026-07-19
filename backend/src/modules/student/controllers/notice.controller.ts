import { validateSchema } from '@/core/errors';
import { asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { ObjectIdSchema } from '../types';
import { StudentService } from '../services/student.service';

export const getNotices = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const data = await StudentService.getNotices();
  res.status(200).json(new OkResponse(data));
});

export const getNoticeDetail = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const noticeId = validateSchema(ObjectIdSchema, String(req.params.noticeId));
    const data = await StudentService.getNoticeDetail(noticeId);
    res.status(200).json(new OkResponse(data));
  },
);
