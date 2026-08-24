import { z } from 'zod';
import { defineContract } from '../envelope';
import { ObjectId, paginatedResponse } from '../primitives';
import {
  CreateStudentFeeBody,
  CreateTeacherSalaryBody,
  CreateTransactionBody,
  ExpenseCategoriesResponse,
  StudentFeeDetail,
  StudentFeeListQuery,
  StudentFeeRecord,
  TeacherSalaryListQuery,
  TeacherSalaryRecord,
  TransactionListQuery,
  TransactionRecord,
  UpdateStatusBody,
  UpdateTransactionBody,
} from '../admin/finance';
import { AdminFinanceAnalytics } from '../admin/analytics';
import { StudentListQuery, StudentRecord } from '../admin/student';
import { TeacherListQuery, TeacherRecord } from '../admin/teacher';

/**
 * The Finance role's module (ALIGNMENT_PLAN.md P4) — the `Finance` `Role` enum member previously
 * had no routes at all; a Finance user could log in and reach nothing. This is not a parallel
 * implementation: every operation here is served by the *same* backend services `/admin/finance/*`
 * already uses (`AdminStudentFeeService`, `AdminTeacherSalaryService`, `AdminTransactionService`,
 * `AdminAnalyticsService`), just mounted under `/finance/*` behind `FinanceOnly` instead of
 * `AdminOnly` — so it reuses the exact same Zod schemas from `../admin/finance` /
 * `../admin/analytics` rather than redefining them, and the two surfaces can never drift out of
 * sync with each other by construction.
 */

const DeleteResponse = z.object({ id: ObjectId });

export const FinanceDashboard = z.object({
  pendingStudentFees: z.object({ count: z.number().int(), totalAmount: z.number() }),
  pendingTeacherSalaries: z.object({ count: z.number().int(), totalAmount: z.number() }),
  collectedThisMonth: z.number(),
  expensesThisMonth: z.number(),
  recentTransactions: z.array(TransactionRecord),
});
export type FinanceDashboard = z.infer<typeof FinanceDashboard>;

export const financeDashboardContract = defineContract({
  get: {
    method: 'GET',
    path: '/finance/dashboard',
    response: FinanceDashboard,
  },
} as const);

export const financeStudentFeeContract = defineContract({
  list: {
    method: 'GET',
    path: '/finance/fee',
    query: StudentFeeListQuery,
    response: paginatedResponse(StudentFeeRecord),
  },
  detail: {
    method: 'GET',
    path: '/finance/fee/:feeId',
    params: z.object({ feeId: ObjectId }),
    response: StudentFeeDetail,
  },
  create: {
    method: 'POST',
    path: '/finance/fee',
    body: CreateStudentFeeBody,
    response: StudentFeeDetail,
    successStatus: 201,
  },
  updateStatus: {
    method: 'PUT',
    path: '/finance/fee/:feeId/status',
    params: z.object({ feeId: ObjectId }),
    body: UpdateStatusBody,
    response: StudentFeeRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/finance/fee/:feeId',
    params: z.object({ feeId: ObjectId }),
    response: DeleteResponse,
    successStatus: 202,
  },
} as const);

export const financeTeacherSalaryContract = defineContract({
  list: {
    method: 'GET',
    path: '/finance/salary',
    query: TeacherSalaryListQuery,
    response: paginatedResponse(TeacherSalaryRecord),
  },
  detail: {
    method: 'GET',
    path: '/finance/salary/:salaryId',
    params: z.object({ salaryId: ObjectId }),
    response: TeacherSalaryRecord,
  },
  create: {
    method: 'POST',
    path: '/finance/salary',
    body: CreateTeacherSalaryBody,
    response: TeacherSalaryRecord,
    successStatus: 201,
  },
  updateStatus: {
    method: 'PUT',
    path: '/finance/salary/:salaryId/status',
    params: z.object({ salaryId: ObjectId }),
    body: UpdateStatusBody,
    response: TeacherSalaryRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/finance/salary/:salaryId',
    params: z.object({ salaryId: ObjectId }),
    response: DeleteResponse,
    successStatus: 202,
  },
} as const);

/** "Expenses" in the Finance UI — the same general-ledger `Transaction` model
 * `adminTransactionContract` exposes, just mounted at `/finance/expense`. */
export const financeExpenseContract = defineContract({
  list: {
    method: 'GET',
    path: '/finance/expense',
    query: TransactionListQuery,
    response: z.array(TransactionRecord),
  },
  detail: {
    method: 'GET',
    path: '/finance/expense/:transactionId',
    params: z.object({ transactionId: ObjectId }),
    response: TransactionRecord,
  },
  create: {
    method: 'POST',
    path: '/finance/expense',
    body: CreateTransactionBody,
    response: TransactionRecord,
    successStatus: 201,
  },
  update: {
    method: 'PUT',
    path: '/finance/expense/:transactionId',
    params: z.object({ transactionId: ObjectId }),
    body: UpdateTransactionBody,
    response: TransactionRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/finance/expense/:transactionId',
    params: z.object({ transactionId: ObjectId }),
    response: DeleteResponse,
    successStatus: 202,
  },
  expenseCategories: {
    method: 'GET',
    path: '/finance/expense/expense-categories',
    response: ExpenseCategoriesResponse,
  },
} as const);

export const financeAnalyticsContract = defineContract({
  get: {
    method: 'GET',
    path: '/finance/analytics',
    query: z.object({ session: z.string().optional() }),
    response: AdminFinanceAnalytics,
  },
} as const);

/** Read-only — Finance needs to pick *which* student/teacher a fee/salary is for, not manage their
 * profiles (that stays Admin-only). Same underlying data as `adminStudentContract.list` /
 * `adminTeacherContract.list`, just mounted where a `FinanceOnly` guard can serve it. */
export const financeDirectoryContract = defineContract({
  students: {
    method: 'GET',
    path: '/finance/student',
    query: StudentListQuery,
    response: paginatedResponse(StudentRecord),
  },
  teachers: {
    method: 'GET',
    path: '/finance/teacher',
    query: TeacherListQuery,
    response: paginatedResponse(TeacherRecord),
  },
} as const);
