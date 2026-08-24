import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { StudentService } from '../services/student.service';

export const getStudent = defineRoute(studentContract.profile, async ({ user }) => {
  return StudentService.getStudentProfile(user!.id);
});
