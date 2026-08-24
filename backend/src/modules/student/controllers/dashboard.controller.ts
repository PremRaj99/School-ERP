import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { StudentService } from '../services/student.service';

export const getDashboard = defineRoute(studentContract.dashboard, async ({ user }) => {
  return StudentService.getDashboard(user!.id);
});

export const getAnalytics = defineRoute(studentContract.analytics, async ({ user }) => {
  return StudentService.getAnalytics(user!.id);
});
