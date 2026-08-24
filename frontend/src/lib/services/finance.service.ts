import {
  financeAnalyticsContract,
  financeDashboardContract,
  financeDirectoryContract,
  financeExpenseContract,
  financeStudentFeeContract,
  financeTeacherSalaryContract,
  type CreateStudentFeeBody,
  type CreateTeacherSalaryBody,
  type CreateTransactionBody,
  type StudentFeeListQuery,
  type StudentFeeRecord,
  type StudentListQuery,
  type TeacherListQuery,
  type TeacherSalaryListQuery,
  type TeacherSalaryRecord,
  type TransactionListQuery,
  type TransactionRecord,
  type UpdateTransactionBody,
} from '@schoolerp/contracts';
import { api } from '../api/typed-client';

/**
 * The Finance role's API surface (ALIGNMENT_PLAN.md P4) — every method here hits `/finance/*`,
 * served by the same backend services `admin.service.ts`'s finance methods hit under
 * `/admin/finance/*`. Kept as its own service file (not merged into `admin.service.ts`) since it's
 * a different role's API surface with its own base paths, even though the shapes are shared.
 */
export const financeService = {
  getDashboard: () => api(financeDashboardContract.get),

  getStudentFees: (query?: StudentFeeListQuery) =>
    api(financeStudentFeeContract.list, { query: query ?? {} }),
  getStudentFeeById: (feeId: string) =>
    api(financeStudentFeeContract.detail, { params: { feeId } }),
  createStudentFee: (body: CreateStudentFeeBody) => api(financeStudentFeeContract.create, { body }),
  updateStudentFeeStatus: (feeId: string, status: StudentFeeRecord['status']) =>
    api(financeStudentFeeContract.updateStatus, { params: { feeId }, body: { status } }),
  deleteStudentFee: (feeId: string): Promise<{ id: string }> =>
    api(financeStudentFeeContract.remove, { params: { feeId } }),

  getTeacherSalaries: (query?: TeacherSalaryListQuery) =>
    api(financeTeacherSalaryContract.list, { query: query ?? {} }),
  getTeacherSalaryById: (salaryId: string) =>
    api(financeTeacherSalaryContract.detail, { params: { salaryId } }),
  createTeacherSalary: (body: CreateTeacherSalaryBody) =>
    api(financeTeacherSalaryContract.create, { body }),
  updateTeacherSalaryStatus: (salaryId: string, status: TeacherSalaryRecord['status']) =>
    api(financeTeacherSalaryContract.updateStatus, { params: { salaryId }, body: { status } }),
  deleteTeacherSalary: (salaryId: string): Promise<{ id: string }> =>
    api(financeTeacherSalaryContract.remove, { params: { salaryId } }),

  getExpenses: (query?: TransactionListQuery): Promise<TransactionRecord[]> =>
    api(financeExpenseContract.list, { query: query ?? {} }),
  getExpenseById: (transactionId: string) =>
    api(financeExpenseContract.detail, { params: { transactionId } }),
  createExpense: (body: CreateTransactionBody) => api(financeExpenseContract.create, { body }),
  updateExpense: (transactionId: string, body: UpdateTransactionBody) =>
    api(financeExpenseContract.update, { params: { transactionId }, body }),
  deleteExpense: (transactionId: string): Promise<{ id: string }> =>
    api(financeExpenseContract.remove, { params: { transactionId } }),
  getExpenseCategories: (): Promise<string[]> => api(financeExpenseContract.expenseCategories),

  getAnalytics: (session?: string) => api(financeAnalyticsContract.get, { query: { session } }),

  // Read-only directory — see `financeDirectoryContract` for why Finance gets this instead of the
  // full admin student/teacher management surface.
  getStudents: (query?: StudentListQuery) =>
    api(financeDirectoryContract.students, { query: query ?? {} }),
  getTeachers: (query?: TeacherListQuery) =>
    api(financeDirectoryContract.teachers, { query: query ?? {} }),
};
