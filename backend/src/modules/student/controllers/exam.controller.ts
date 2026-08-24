import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { StudentService } from '../services/student.service';

export const getExams = defineRoute(studentContract.exams, async ({ user }) => {
  return StudentService.getExams(user!.id);
});
