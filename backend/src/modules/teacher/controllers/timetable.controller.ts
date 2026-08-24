import { teacherContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { TeacherService } from '../services/teacher.service';

export const getTimeTables = defineRoute(teacherContract.academicTimetable, async ({ user }) => {
  return TeacherService.getTimetables(user!.id);
});
