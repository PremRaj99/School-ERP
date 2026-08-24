import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { StudentService } from '../services/student.service';

export const getSubjects = defineRoute(studentContract.subjects, async ({ user }) => {
  return StudentService.getSubjects(user!.id);
});
