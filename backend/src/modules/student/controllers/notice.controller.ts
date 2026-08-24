import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { StudentService } from '../services/student.service';

export const getNotices = defineRoute(studentContract.notices, async () => {
  return StudentService.getNotices();
});

export const getNoticeDetail = defineRoute(studentContract.noticeDetail, async ({ params }) => {
  return StudentService.getNoticeDetail(params.noticeId);
});
