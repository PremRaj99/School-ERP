import { Router } from 'express';
import { createNotice, deleteNotice, getNoticeDetail, getNotices } from '../../controllers/notice.controller';
export const noticeRouter = Router()

noticeRouter.get("/", getNotices)
noticeRouter.post("/:noticeId", createNotice)
noticeRouter.get("/:noticeId", getNoticeDetail)
noticeRouter.delete("/:noticeId", deleteNotice)