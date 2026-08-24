import { teacherContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { TeacherService } from '../services/teacher.service';

export const getDashboard = defineRoute(teacherContract.dashboard, async ({ user }) => {
  return TeacherService.getDashboard(user!.id);
});

export const getAnalytics = defineRoute(teacherContract.analytics, async ({ user, query }) => {
  return TeacherService.getAnalytics(user!.id, query.session);
});
