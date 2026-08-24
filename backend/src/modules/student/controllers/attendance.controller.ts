import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { StudentService } from '../services/student.service';

export const getAttendance = defineRoute(studentContract.attendance, async ({ user, query }) => {
  return StudentService.getAttendance(user!.id, query.month);
});
