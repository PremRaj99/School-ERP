import { z } from 'zod';
import { defineContract } from '../envelope';
import { ClassName, ISODate, ObjectId, Section, StudentId } from '../primitives';

/**
 * Admin view of student attendance (ALIGNMENT_PLAN.md P3) — admins previously had no way to see
 * student attendance at all (only mark/view *teacher* attendance). This is a summary report over
 * a date range for one class, not a day-by-day grid — day-by-day marking is the teacher's job
 * (`teacherContract.classAttendanceDetail`); admin needs "how is this class doing," not another
 * marking UI.
 */
export const StudentAttendanceSummaryRow = z.object({
  studentId: StudentId,
  rollNo: z.number().int(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  presentCount: z.number().int(),
  absentCount: z.number().int(),
  leaveCount: z.number().int(),
  /** Out of `totalMarkedDays` in the report, not the full calendar span — an unmarked day counts
   * against nobody's percentage. */
  attendancePercent: z.number(),
});
export type StudentAttendanceSummaryRow = z.infer<typeof StudentAttendanceSummaryRow>;

export const AdminStudentAttendanceReport = z.object({
  classId: ObjectId,
  className: ClassName,
  section: Section,
  from: ISODate,
  to: ISODate,
  /** Count of distinct dates within [from, to] where this class's attendance was actually marked
   * (`ClassAttendance.isMarked`) — the denominator for every row's `attendancePercent`. */
  totalMarkedDays: z.number().int(),
  students: z.array(StudentAttendanceSummaryRow),
});
export type AdminStudentAttendanceReport = z.infer<typeof AdminStudentAttendanceReport>;

export const AdminStudentAttendanceQuery = z.object({
  classId: ObjectId,
  from: ISODate,
  to: ISODate,
});
export type AdminStudentAttendanceQuery = z.infer<typeof AdminStudentAttendanceQuery>;

export const adminStudentAttendanceContract = defineContract({
  report: {
    method: 'GET',
    path: '/admin/attendance/student',
    query: AdminStudentAttendanceQuery,
    response: AdminStudentAttendanceReport,
  },
} as const);
