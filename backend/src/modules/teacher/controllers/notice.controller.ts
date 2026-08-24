import { teacherContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { TeacherService } from '../services/teacher.service';

export const getNotices = defineRoute(teacherContract.notices, async () => {
  return TeacherService.getNotices();
});

export const getNoticeDetail = defineRoute(teacherContract.noticeDetail, async ({ params }) => {
  return TeacherService.getNoticeDetail(params.noticeId);
});
