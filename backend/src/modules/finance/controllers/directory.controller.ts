import { financeDirectoryContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminStudentService } from '@/modules/admin/services/student.service';
import { AdminTeacherService } from '@/modules/admin/services/teacher.service';

// Read-only — see `financeDirectoryContract`'s doc comment for why Finance gets this instead of
// the full `/admin/student` and `/admin/teacher` surfaces.
export const getStudentsForFinance = defineRoute(
  financeDirectoryContract.students,
  async ({ query }) => {
    return AdminStudentService.getStudents(query);
  },
);

export const getTeachersForFinance = defineRoute(
  financeDirectoryContract.teachers,
  async ({ query }) => {
    return AdminTeacherService.getTeachers(query);
  },
);
