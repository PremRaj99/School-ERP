import { adminNoticeContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminNoticeService } from '../services/notice.service';

export const getNotices = defineRoute(adminNoticeContract.list, async ({ query }) => {
  return AdminNoticeService.getNotices(query);
});

export const getNoticeDetail = defineRoute(adminNoticeContract.detail, async ({ params }) => {
  return AdminNoticeService.getNoticeDetail(params.noticeId);
});

export const createNotice = defineRoute(adminNoticeContract.create, async ({ body }) => {
  return AdminNoticeService.createNotice(body);
});

export const updateNotice = defineRoute(adminNoticeContract.update, async ({ params, body }) => {
  return AdminNoticeService.updateNotice(params.noticeId, body);
});

export const deleteNotice = defineRoute(adminNoticeContract.remove, async ({ params }) => {
  return AdminNoticeService.deleteNotice(params.noticeId);
});
