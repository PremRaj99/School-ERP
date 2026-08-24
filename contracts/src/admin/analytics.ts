import { z } from 'zod';
import { defineContract } from '../envelope';
import {
  ClassName,
  ISODate,
  ISOMonth,
  ObjectId,
  Section,
  StudentId,
  SubjectCode,
  Session,
  TeacherId,
} from '../primitives';
import { TxnCategoryEnum, WeekDayEnum } from '../enums';
import { SubjectRecord } from './subject';

// ---- Overview ---------------------------------------------------------------

export const AdminOverviewAnalytics = z.object({
  kpis: z.object({
    totalStudents: z.number().int(),
    totalTeachers: z.number().int(),
    totalClasses: z.number().int(),
    totalSubjects: z.number().int(),
    /** Paid ÷ (Paid + Pending) fee amount raised this session, ×100. `null` if nothing raised. */
    collectionRatePct: z.number().nullable(),
    /** Student attendance present ÷ total marked this month, ×100. `null` if nothing marked. */
    attendanceRatePct: z.number().nullable(),
  }),
  enrollmentBySession: z.array(z.object({ session: Session, count: z.number().int() })),
  studentsByClass: z.array(
    z.object({ className: ClassName, section: Section, count: z.number().int() }),
  ),
  admissionsByMonth: z.array(z.object({ month: ISOMonth, count: z.number().int() })),
});
export type AdminOverviewAnalytics = z.infer<typeof AdminOverviewAnalytics>;

// ---- Attendance ---------------------------------------------------------------

export const AdminAttendanceAnalytics = z.object({
  dailyAttendancePct: z.array(z.object({ date: ISODate, presentPct: z.number() })),
  classHeatmap: z.array(
    z.object({
      className: ClassName,
      section: Section,
      weekday: WeekDayEnum,
      presentPct: z.number(),
    }),
  ),
  statusSplit: z.object({
    present: z.number().int(),
    absent: z.number().int(),
    leave: z.number().int(),
  }),
  /** Students under 75% attendance within the requested range. */
  chronicAbsentees: z.array(
    z.object({
      studentId: StudentId,
      firstName: z.string(),
      lastName: z.string().nullable(),
      className: ClassName,
      section: Section,
      attendancePct: z.number(),
    }),
  ),
});
export type AdminAttendanceAnalytics = z.infer<typeof AdminAttendanceAnalytics>;

export const AdminAttendanceAnalyticsQuery = z.object({
  from: ISODate,
  to: ISODate,
  className: ClassName.optional(),
  section: Section.optional(),
});
export type AdminAttendanceAnalyticsQuery = z.infer<typeof AdminAttendanceAnalyticsQuery>;

// ---- Academics ---------------------------------------------------------------

const PerformerRow = z.object({
  studentId: StudentId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  totalPct: z.number(),
});

export const AdminAcademicsAnalytics = z.object({
  examTitle: z.string(),
  gradeDistribution: z.array(z.object({ grade: z.string(), count: z.number().int() })),
  subjectAverages: z.array(
    z.object({ subjectCode: SubjectCode, subjectName: z.string(), averagePct: z.number() }),
  ),
  /** `null` if no results have been entered yet. */
  passRatePct: z.number().nullable(),
  topPerformers: z.array(PerformerRow),
  bottomPerformers: z.array(PerformerRow),
  markingCompletionPct: z.number(),
});
export type AdminAcademicsAnalytics = z.infer<typeof AdminAcademicsAnalytics>;

// ---- Finance ---------------------------------------------------------------

export const AdminFinanceAnalytics = z.object({
  monthly: z.array(z.object({ month: ISOMonth, collected: z.number(), pending: z.number() })),
  categorySplit: z.array(z.object({ category: TxnCategoryEnum, amount: z.number() })),
  cumulativeCollection: z.array(z.object({ month: ISOMonth, cumulative: z.number() })),
  defaulters: z.array(
    z.object({
      studentId: StudentId,
      firstName: z.string(),
      lastName: z.string().nullable(),
      className: ClassName,
      section: Section,
      month: ISOMonth,
      amount: z.number(),
    }),
  ),
  salaryVsCollection: z.array(
    z.object({ month: ISOMonth, salaryBurn: z.number(), feeCollection: z.number() }),
  ),
  // P4 (ALIGNMENT_PLAN.md) — breaks the `Other`-category spend down by the free-text
  // `expenseCategory` label (books, whiteboards, ...) instead of leaving it as one lump "Other"
  // figure in `categorySplit`, and tracks it by month the same way fee collection is tracked.
  expenseBreakdown: z.array(z.object({ label: z.string(), amount: z.number() })),
  monthlyExpenses: z.array(z.object({ month: ISOMonth, amount: z.number() })),
  totalExpenses: z.number(),
});
export type AdminFinanceAnalytics = z.infer<typeof AdminFinanceAnalytics>;

// ---- Staff ---------------------------------------------------------------

const TeacherNameRow = z.object({
  teacherId: TeacherId,
  firstName: z.string(),
  lastName: z.string().nullable(),
});

export const AdminStaffAnalytics = z.object({
  attendanceLeaderboard: z.array(TeacherNameRow.extend({ attendancePct: z.number() })),
  workload: z.array(TeacherNameRow.extend({ periodsPerWeek: z.number().int() })),
  markingCompletion: z.array(TeacherNameRow.extend({ completionPct: z.number() })),
  /** Subjects that exist but have zero timetable periods assigned to any class. */
  subjectCoverageGaps: z.array(SubjectRecord),
});
export type AdminStaffAnalytics = z.infer<typeof AdminStaffAnalytics>;

// ---- Contract group ---------------------------------------------------------

export const adminAnalyticsContract = defineContract({
  overview: {
    method: 'GET',
    path: '/admin/analytics/overview',
    query: z.object({ session: Session.optional() }),
    response: AdminOverviewAnalytics,
  },
  attendance: {
    method: 'GET',
    path: '/admin/analytics/attendance',
    query: AdminAttendanceAnalyticsQuery,
    response: AdminAttendanceAnalytics,
  },
  academics: {
    method: 'GET',
    path: '/admin/analytics/academics',
    query: z.object({ examId: ObjectId }),
    response: AdminAcademicsAnalytics,
  },
  finance: {
    method: 'GET',
    path: '/admin/analytics/finance',
    query: z.object({ session: Session.optional() }),
    response: AdminFinanceAnalytics,
  },
  staff: {
    method: 'GET',
    path: '/admin/analytics/staff',
    query: z.object({ month: ISOMonth }),
    response: AdminStaffAnalytics,
  },
} as const);
