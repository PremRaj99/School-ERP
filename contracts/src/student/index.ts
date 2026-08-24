import { z } from 'zod';
import { defineContract } from '../envelope';
import { ISODate, ISOMonth, ObjectId, Session } from '../primitives';
import { AttendanceStatusEnum } from '../enums';
import { StudentRecord } from '../admin/student';
import { SubjectRecord } from '../admin/subject';
import { NoticeRecord, NoticeSummary } from '../admin/notice';
import { ClassSchedule } from '../admin/timetable';
import { CalendarEventRecord } from '../admin/academicCalendar';
import { FeeBreakdownItem } from '../admin/finance';
import { TxnStatusEnum } from '../enums';

// ---- Profile / dashboard ----------------------------------------------------

export const StudentDashboard = z.object({
  profile: z.object({
    studentId: StudentRecord.shape.studentId,
    firstName: z.string(),
    lastName: z.string().nullable(),
    rollNo: z.number().int(),
    profilePhoto: z.string(),
    className: z.string(),
    section: z.string(),
    session: Session,
  }),
  attendanceThisMonth: z.object({
    present: z.number().int(),
    absent: z.number().int(),
    leave: z.number().int(),
    total: z.number().int(),
  }),
  upcomingExams: z.array(
    z.object({ id: ObjectId, title: z.string(), dateFrom: ISODate, dateTo: ISODate.nullable() }),
  ),
  recentNotices: z.array(NoticeSummary),
  pendingFees: z.object({ count: z.number().int(), totalAmount: z.number() }),
});
export type StudentDashboard = z.infer<typeof StudentDashboard>;

// ---- Attendance ---------------------------------------------------------

export const StudentAttendanceDay = z.object({ date: ISODate, status: AttendanceStatusEnum });
export type StudentAttendanceDay = z.infer<typeof StudentAttendanceDay>;

// ---- Exams / results ------------------------------------------------------

export const StudentExamSummary = z.object({
  id: ObjectId,
  title: z.string(),
  dateFrom: ISODate,
  dateTo: ISODate.nullable(),
  isResultDecleared: z.boolean(),
});
export type StudentExamSummary = z.infer<typeof StudentExamSummary>;

export const StudentResult = z.object({
  id: ObjectId,
  dateFrom: ISODate,
  dateTo: ISODate.nullable(),
  title: z.string(),
  studentId: StudentRecord.shape.studentId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  className: z.string(),
  section: z.string(),
  rollNo: z.number().int(),
  marks: z.array(
    z.object({
      subjectCode: z.string(),
      subjectName: z.string(),
      date: ISODate,
      marksObtained: z.number(),
      fullMarks: z.number(),
      grade: z.string(),
      remark: z.string().nullable(),
    }),
  ),
});
export type StudentResult = z.infer<typeof StudentResult>;

// ---- Fees (view-only) ------------------------------------------------------

export const MyFeeRecord = z.object({
  id: ObjectId,
  month: ISOMonth,
  finalAmount: z.number(),
  status: TxnStatusEnum,
  // Same caveat as the admin finance contracts — `Transaction.createdAt`, not a real payment date
  // yet (ALIGNMENT_PLAN.md 2D/D3).
  paidAt: ISODate,
});
export type MyFeeRecord = z.infer<typeof MyFeeRecord>;

export const MyFeeDetail = MyFeeRecord.extend({
  className: z.string(),
  section: z.string(),
  session: Session,
  rollNo: z.number().int(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  feeBreakdown: z.array(FeeBreakdownItem),
});
export type MyFeeDetail = z.infer<typeof MyFeeDetail>;

// ---- Analytics ---------------------------------------------------------------

export const StudentAnalytics = z.object({
  attendanceTrend: z.array(z.object({ month: ISOMonth, presentPct: z.number() })),
  subjectMarks: z.array(
    z.object({
      subjectCode: z.string(),
      subjectName: z.string(),
      examTitle: z.string(),
      date: ISODate,
      pct: z.number(),
    }),
  ),
  /** `null` if no exam has been declared for this student yet. */
  latestExamBreakdown: z
    .array(z.object({ subjectCode: z.string(), subjectName: z.string(), pct: z.number() }))
    .nullable(),
  gradeHistory: z.array(z.object({ examTitle: z.string(), date: ISODate, averagePct: z.number() })),
  rankTrend: z.array(
    z.object({
      examTitle: z.string(),
      date: ISODate,
      rank: z.number().int(),
      classSize: z.number().int(),
    }),
  ),
  feeHistory: z.array(z.object({ month: ISOMonth, paid: z.number(), pending: z.number() })),
});
export type StudentAnalytics = z.infer<typeof StudentAnalytics>;

// ---- Contract group ---------------------------------------------------------

export const studentContract = defineContract({
  profile: {
    method: 'GET',
    path: '/student',
    response: StudentRecord,
  },
  dashboard: {
    method: 'GET',
    path: '/student/dashboard',
    response: StudentDashboard,
  },
  // No `session` filter — a `Student` row is tied to exactly one current `Class` (no historical
  // session tracking across years, since session promotion/D5 doesn't exist yet), so a student's
  // entire attendance/exam/fee history is already implicitly scoped to themselves.
  analytics: {
    method: 'GET',
    path: '/student/analytics',
    response: StudentAnalytics,
  },
  attendance: {
    method: 'GET',
    path: '/student/attendance',
    query: z.object({ month: ISOMonth }),
    response: z.array(StudentAttendanceDay),
  },
  subjects: {
    method: 'GET',
    path: '/student/subject/get-all-subject',
    response: z.array(SubjectRecord),
  },
  exams: {
    method: 'GET',
    path: '/student/exam',
    response: z.array(StudentExamSummary),
  },
  result: {
    method: 'GET',
    path: '/student/result/:examId',
    params: z.object({ examId: ObjectId }),
    response: StudentResult,
  },
  notices: {
    method: 'GET',
    path: '/student/notice',
    response: z.array(NoticeSummary),
  },
  noticeDetail: {
    method: 'GET',
    path: '/student/notice/:noticeId',
    params: z.object({ noticeId: ObjectId }),
    response: NoticeRecord,
  },
  timetable: {
    method: 'GET',
    path: '/student/academic/time-table',
    response: z.array(ClassSchedule),
  },
  calendar: {
    method: 'GET',
    path: '/student/academic/calendar',
    response: z.array(CalendarEventRecord),
  },
  fees: {
    method: 'GET',
    path: '/student/transaction',
    query: z.object({ year: Session }),
    response: z.array(MyFeeRecord),
  },
  feeDetail: {
    method: 'GET',
    path: '/student/transaction/:feeId',
    params: z.object({ feeId: ObjectId }),
    response: MyFeeDetail,
  },
} as const);
