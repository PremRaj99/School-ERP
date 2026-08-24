/**
 * Prisma `where` fragment for "student is active," shared by every query that needs to scope
 * itself to the active roster (admin student list, admin student-attendance report, session
 * promotion). Not `{ status: 'Active' }` — see `AdminStudentService.getStudents` for the full
 * explanation: `status` (D5) is a new field, so a pre-existing Student document has no such key
 * in Mongo at all, and a strict equality filter would silently exclude it. `notIn` the other two
 * statuses matches an explicit `'Active'` and a missing field the same way.
 */
import type { StudentStatus } from '@schoolerp/contracts';

export const ACTIVE_STUDENT_STATUS_FILTER = {
  status: { notIn: ['TransferredOut', 'Graduated'] satisfies StudentStatus[] },
};
