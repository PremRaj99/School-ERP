import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { CreateNoticeSchema, ObjectIdSchema } from '../types';
import { AdminNoticeService } from '../services/notice.service';

export const getNotices = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const data = await AdminNoticeService.getNotices();
  res.status(200).json(new OkResponse(data));
});

export const getNoticeDetail = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const noticeId = validateSchema(ObjectIdSchema, String(req.params.noticeId));
    const data = await AdminNoticeService.getNoticeDetail(noticeId);
    res.status(200).json(new OkResponse(data));
  },
);

export const createNotice = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const parseData = validateSchema(CreateNoticeSchema, req.body);
    await AdminNoticeService.createNotice(parseData);
    res.status(201).json(new CreatedResponse());
  },
);

export const deleteNotice = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const noticeId = validateSchema(ObjectIdSchema, String(req.params.noticeId));
    await AdminNoticeService.deleteNotice(noticeId);
    res.status(202).json(new AcceptedResponse());
  },
);
