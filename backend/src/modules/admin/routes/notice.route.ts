import { Router } from 'express';
import {
  createNotice,
  deleteNotice,
  getNoticeDetail,
  getNotices,
  updateNotice,
} from '../controllers/notice.controller';

export const noticeRouter = Router();

noticeRouter.get('/', getNotices);
noticeRouter.post('/', createNotice);
noticeRouter.get('/:noticeId', getNoticeDetail);
noticeRouter.put('/:noticeId', updateNotice);
noticeRouter.delete('/:noticeId', deleteNotice);
