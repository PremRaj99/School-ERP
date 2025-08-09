import { Router } from 'express';
export const noticeRouter = Router()

noticeRouter.get("/", getNotices)
noticeRouter.get("/:noticeId", getNoticeDetail)
noticeRouter.delete("/:noticeId", deleteNotice)