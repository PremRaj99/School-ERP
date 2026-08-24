import { z } from 'zod';
import { defineContract } from '../envelope';
import { ClassName, ISODate, ObjectId, Section } from '../primitives';
import { NoticeSummary } from './notice';

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
});
export type AdminDashboard = z.infer<typeof AdminDashboard>;

export const adminDashboardContract = defineContract({
  get: {
    method: 'GET',
    path: '/admin/dashboard',
    response: AdminDashboard,
  },
} as const);
