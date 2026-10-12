import { z } from 'zod';
import { defineContract } from '../envelope';
import { ClassName, ISODate, ObjectId, Section, Session, StudentId } from '../primitives';
import { AttendanceStatusEnum } from '../enums';

/**
 * Admin view of student attendance (ALIGNMENT_PLAN.md P3) — admins previously had no way to see
 * student attendance at all (only mark/view *teacher* attendance). Read-only: marking stays the
 * teacher's job (`teacherContract.classAttendanceDetail`). Two reports:
 *  - `report`: one class over a date range — per-student totals plus each student's day-by-day
 *    statuses (`daily`), so the same response feeds both a summary table and a daily register.
 *  - `classesSummary`: every class in a session over a date range, one aggregate row per class.
 */
export const StudentDailyAttendance = z.object({
  date: ISODate,
  status: AttendanceStatusEnum,
});
export type StudentDailyAttendance = z.infer<typeof StudentDailyAttendance>;

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
  /** Every recorded status in the range, date-ascending. A marked date missing here means no
   * status was recorded for this student that day. */
  daily: z.array(StudentDailyAttendance),
});
export type StudentAttendanceSummaryRow = z.infer<typeof StudentAttendanceSummaryRow>;

export const AdminStudentAttendanceReport = z.object({
  classId: ObjectId,
  className: ClassName,
  section: Section,
  from: ISODate,
  to: ISODate,
  /** Count of distinct dates within [from, to] where this class's attendance was actually marked
   * (`ClassAttendance.isMarked`) — the denominator for every row's `attendancePercent`. A day
   * marked on what is now a holiday is left out. */
  totalMarkedDays: z.number().int(),
  /** The marked dates themselves (date-ascending) — the columns of a daily register. */
  markedDates: z.array(ISODate),
  /** Non-working days in [from, to] (Sundays and calendar HOLIDAY events), date-ascending — a
   * daily register shows these as "H". */
  holidays: z.array(z.object({ date: ISODate, title: z.string() })),
  students: z.array(StudentAttendanceSummaryRow),
});
export type AdminStudentAttendanceReport = z.infer<typeof AdminStudentAttendanceReport>;

export const AdminStudentAttendanceQuery = z.object({
  classId: ObjectId,
  from: ISODate,
  to: ISODate,
});
export type AdminStudentAttendanceQuery = z.infer<typeof AdminStudentAttendanceQuery>;

export const ClassAttendanceSummaryRow = z.object({
  classId: ObjectId,
  className: ClassName,
  section: Section,
  studentCount: z.number().int(),
  /** Distinct non-holiday dates in the range where this class's attendance was marked. */
  totalMarkedDays: z.number().int(),
  presentCount: z.number().int(),
  absentCount: z.number().int(),
  leaveCount: z.number().int(),
  /** presentCount ÷ (studentCount × totalMarkedDays), 0 when nothing was marked. */
  attendancePercent: z.number(),
});
export type ClassAttendanceSummaryRow = z.infer<typeof ClassAttendanceSummaryRow>;

export const AdminClassesAttendanceQuery = z.object({
  session: Session,
  from: ISODate,
  to: ISODate,
});
export type AdminClassesAttendanceQuery = z.infer<typeof AdminClassesAttendanceQuery>;

export const AdminClassesAttendanceSummary = z.object({
  session: Session,
  from: ISODate,
  to: ISODate,
  classes: z.array(ClassAttendanceSummaryRow),
});
export type AdminClassesAttendanceSummary = z.infer<typeof AdminClassesAttendanceSummary>;

export const adminStudentAttendanceContract = defineContract({
  report: {
    method: 'GET',
    path: '/admin/attendance/student',
    query: AdminStudentAttendanceQuery,
    response: AdminStudentAttendanceReport,
  },
  classesSummary: {
    method: 'GET',
    path: '/admin/attendance/student/classes',
    query: AdminClassesAttendanceQuery,
    response: AdminClassesAttendanceSummary,
  },
} as const);
