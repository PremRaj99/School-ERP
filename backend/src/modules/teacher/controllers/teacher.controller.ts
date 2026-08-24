import { teacherContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { TeacherService } from '../services/teacher.service';

export const getTeacher = defineRoute(teacherContract.profile, async ({ user }) => {
  return TeacherService.getTeacherProfile(user!.id);
});
