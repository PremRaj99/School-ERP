import { adminTeacherAttendanceContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminTeacherAttendanceService } from '../services/teacherAttendance.service';

export const getTeacherAttendanceForDate = defineRoute(
  adminTeacherAttendanceContract.getByDate,
  async ({ query }) => {
    return AdminTeacherAttendanceService.getTeacherAttendanceByDate(query.date);
  },
);

export const getTeacherAttendanceForMonth = defineRoute(
  adminTeacherAttendanceContract.getByMonth,
  async ({ params, query }) => {
    return AdminTeacherAttendanceService.getTeacherAttendanceByMonth(params.teacherId, query.month);
  },
);

export const markTeacherAttendanceForDate = defineRoute(
  adminTeacherAttendanceContract.mark,
  async ({ query, body }) => {
    return AdminTeacherAttendanceService.markTeacherAttendance(query.date, body);
  },
);

export const updateTeacherAttendanceForDate = defineRoute(
  adminTeacherAttendanceContract.update,
  async ({ body }) => {
    return AdminTeacherAttendanceService.updateTeacherAttendance(body);
  },
);
