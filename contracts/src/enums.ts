import { z } from 'zod';

/**
 * Mirrors of `backend/prisma/schema.prisma` enums. One definition, imported by every module
 * (backend request validation, backend response typing, frontend selects/forms) instead of the
 * current situation where each layer re-typed its own copy by hand.
 *
 * If you add/rename/remove a Prisma enum value, update it here and every consumer's typecheck
 * fails until it's handled — that's the point.
 */

export const RoleEnum = z.enum(['Student', 'Teacher', 'Finance', 'Admin']);
export type Role = z.infer<typeof RoleEnum>;

export const AttendanceStatusEnum = z.enum(['Present', 'Absent', 'Leave']);
export type AttendanceStatus = z.infer<typeof AttendanceStatusEnum>;

export const StudentStatusEnum = z.enum(['Active', 'TransferredOut', 'Graduated']);
export type StudentStatus = z.infer<typeof StudentStatusEnum>;

export const TargetRoleEnum = z.enum(['Student', 'Teacher', 'All']);
export type TargetRole = z.infer<typeof TargetRoleEnum>;

export const WeekDayEnum = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']);
export type WeekDay = z.infer<typeof WeekDayEnum>;

export const TxnStatusEnum = z.enum(['Paid', 'Pending', 'Failed']);
export type TxnStatus = z.infer<typeof TxnStatusEnum>;

export const TxnCategoryEnum = z.enum(['Utility', 'Infrastructure', 'Fee', 'Salary', 'Other']);
export type TxnCategory = z.infer<typeof TxnCategoryEnum>;

export const AcademicCalendarCategoryEnum = z.enum(['HOLIDAY', 'EVENT', 'EXAM', 'OTHER']);
export type AcademicCalendarCategory = z.infer<typeof AcademicCalendarCategoryEnum>;

export const GenderEnum = z.enum(['Male', 'Female', 'Other']);
export type Gender = z.infer<typeof GenderEnum>;
