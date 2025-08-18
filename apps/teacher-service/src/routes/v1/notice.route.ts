import { Router } from 'express';
import { getNoticeDetail, getNotices } from '../../controllers/notice.contoller';
export const noticeRouter = Router()

noticeRouter.get("/", getNotices)
noticeRouter.get("/:noticeId", getNoticeDetail)