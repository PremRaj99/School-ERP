import { z } from 'zod';
import { defineContract } from '../envelope';
import { ClassName, ISODate, ISOMonth, ObjectId, Section } from '../primitives';
import { NoticeSummary } from './notice';
import { SessionFeeDues } from './finance';

/**
 * One class's fees for the dashboard's month. `expected` = collected + pending + the class's
 * `monthlyFee` for each student whose fee for the month hasn't been generated yet.
 */
export const ClassFeeSummary = z.object({
  classId: ObjectId,
  className: ClassName,
  section: Section,
  /** The class's monthly fee (its own, or the school default). */
  monthlyFee: z.number(),
  students: z.number().int(),
  paidCount: z.number().int(),
  pendingCount: z.number().int(),
  notGeneratedCount: z.number().int(),
  collected: z.number(),
  pending: z.number(),
  expected: z.number(),
});
export type ClassFeeSummary = z.infer<typeof ClassFeeSummary>;

export const AdminDashboard = z.object({
  counts: z.object({
    students: z.number().int(),
    teachers: z.number().int(),
    classes: z.number().int(),
    subjects: z.number().int(),
  }),
  todayTeacherAttendance: z.object({
    date: ISODate,
    present: z.number().int(),
    absent: z.number().int(),
    leave: z.number().int(),
    unmarked: z.number().int(),
    total: z.number().int(),
  }),
  upcomingExams: z.array(
    z.object({
      id: ObjectId,
      title: z.string(),
      className: ClassName,
      section: Section,
      dateFrom: ISODate,
      dateTo: ISODate.nullable(),
    }),
  ),
  recentNotices: z.array(NoticeSummary),
  finance: z.object({
    pendingStudentFees: z.object({ count: z.number().int(), totalAmount: z.number() }),
    pendingTeacherSalaries: z.object({ count: z.number().int(), totalAmount: z.number() }),
  }),
  /** The current session's student fees so far (April up to this month). */
  sessionFeeDues: SessionFeeDues,
  /** Current month's fees, class by class (this session's active classes only). */
  classWiseFees: z.object({
    month: ISOMonth,
    defaultMonthlyFee: z.number(),
    classes: z.array(ClassFeeSummary),
  }),
});
export type AdminDashboard = z.infer<typeof AdminDashboard>;

export const adminDashboardContract = defineContract({
  get: {
    method: 'GET',
    path: '/admin/dashboard',
    response: AdminDashboard,
  },
} as const);
