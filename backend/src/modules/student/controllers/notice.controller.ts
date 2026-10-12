import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { StudentService } from '../services/student.service';

export const getNotices = defineRoute(studentContract.notices, async ({ user }) => {
  return StudentService.getNotices(user!.id);
});

export const getNoticeDetail = defineRoute(
  studentContract.noticeDetail,
  async ({ params, user }) => {
    return StudentService.getNoticeDetail(user!.id, params.noticeId);
  },
);
