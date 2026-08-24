import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { StudentService } from '../services/student.service';

export const getTimeTables = defineRoute(studentContract.timetable, async ({ user }) => {
  return StudentService.getTimetables(user!.id);
});
