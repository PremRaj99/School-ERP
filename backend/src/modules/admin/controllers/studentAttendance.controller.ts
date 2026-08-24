import { adminStudentAttendanceContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminStudentAttendanceService } from '../services/studentAttendance.service';

export const getStudentAttendanceReport = defineRoute(
  adminStudentAttendanceContract.report,
  async ({ query }) => {
    return AdminStudentAttendanceService.getReport(query);
  },
);
