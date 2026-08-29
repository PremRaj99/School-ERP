import { z } from 'zod';
import { defineContract } from '../envelope';
import {
  ClassName,
  ISODate,
  ISOMonth,
  ObjectId,
  PageQuery,
  Section,
  Session,
  StudentId,
  TeacherId,
  paginatedResponse,
} from '../primitives';
import { TxnCategoryEnum, TxnStatusEnum } from '../enums';

// ---- Student fees ---------------------------------------------------------

export const FeeBreakdownItem = z.object({
  feeType: z
    .string({ message: 'Fee type is required.' })
    .min(2, 'Fee type must be at least 2 characters long.'),
  amount: z
    .number({ message: 'Amount is required.' })
    .positive('Amount must be a positive number.'),
});
export type FeeBreakdownItem = z.infer<typeof FeeBreakdownItem>;

export const StudentFeeRecord = z.object({
  id: ObjectId,
  studentId: StudentId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  className: ClassName.optional(),
  section: Section.optional(),
  rollNo: z.number().int(),
  month: ISOMonth,
  title: z.string(),
  finalAmount: z.number(),
  status: TxnStatusEnum,
  // NOTE: this is `Transaction.createdAt`, not an actual payment date — there's no `paidAt` column
  // on `Transaction` yet (ALIGNMENT_PLAN.md 2D/D3, a schema change, not done in this phase). A
  // `Pending` fee already carries a (misleading) "paid at" timestamp because of this.
  paidAt: ISODate,
});
export type StudentFeeRecord = z.infer<typeof StudentFeeRecord>;

export const StudentFeeDetail = StudentFeeRecord.extend({
  session: Session.optional(),
  feeBreakdown: z.array(FeeBreakdownItem),
});
export type StudentFeeDetail = z.infer<typeof StudentFeeDetail>;

export const StudentFeeListQuery = PageQuery.extend({
  studentId: StudentId.optional(),
  className: ClassName.optional(),
  section: Section.optional(),
  session: Session.optional(),
  month: ISOMonth.optional(),
  status: TxnStatusEnum.optional(),
  sortBy: z.enum(['month', 'finalAmount', 'paidAt']).optional(),
});
export type StudentFeeListQuery = z.infer<typeof StudentFeeListQuery>;

export const CreateStudentFeeBody = z.object({
  studentId: StudentId,
  month: ISOMonth,
  title: z.string().min(2, 'Title must be at least 2 characters long.').optional(),
  feeBreakdown: z
    .array(FeeBreakdownItem, { message: 'Fee breakdown is required.' })
    .min(1, 'At least one fee breakdown item is required.'),
});
export type CreateStudentFeeBody = z.infer<typeof CreateStudentFeeBody>;

export const UpdateStudentFeeBody = z.object({
  month: ISOMonth.optional(),
  title: z.string().min(2, 'Title must be at least 2 characters long.').optional(),
  feeBreakdown: z
    .array(FeeBreakdownItem, { message: 'Fee breakdown is required.' })
    .min(1, 'At least one fee breakdown item is required.')
    .optional(),
});
export type UpdateStudentFeeBody = z.infer<typeof UpdateStudentFeeBody>;

export const UpdateStatusBody = z.object({ status: TxnStatusEnum });
export type UpdateStatusBody = z.infer<typeof UpdateStatusBody>;

export const DeleteFeeResponse = z.object({ id: ObjectId });

export const adminStudentFeeContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/finance/student-fee',
    query: StudentFeeListQuery,
    response: paginatedResponse(StudentFeeRecord),
  },
  detail: {
    method: 'GET',
    path: '/admin/finance/student-fee/:feeId',
    params: z.object({ feeId: ObjectId }),
    response: StudentFeeDetail,
  },
  create: {
    method: 'POST',
    path: '/admin/finance/student-fee',
    body: CreateStudentFeeBody,
    response: StudentFeeDetail,
    successStatus: 201,
  },
  update: {
    method: 'PUT',
    path: '/admin/finance/student-fee/:feeId',
    params: z.object({ feeId: ObjectId }),
    body: UpdateStudentFeeBody,
    response: StudentFeeDetail,
    successStatus: 202,
  },
  updateStatus: {
    method: 'PUT',
    path: '/admin/finance/student-fee/:feeId/status',
    params: z.object({ feeId: ObjectId }),
    body: UpdateStatusBody,
    response: StudentFeeRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/finance/student-fee/:feeId',
    params: z.object({ feeId: ObjectId }),
    response: DeleteFeeResponse,
    successStatus: 202,
  },
} as const);

// ---- Teacher salaries -------------------------------------------------------

export const TeacherSalaryRecord = z.object({
  id: ObjectId,
  teacherId: TeacherId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  month: ISOMonth,
  title: z.string(),
  finalAmount: z.number(),
  status: TxnStatusEnum,
  // Same caveat as StudentFeeRecord.paidAt — this is `Transaction.createdAt`, not a real payment date.
  paidAt: ISODate,
});
export type TeacherSalaryRecord = z.infer<typeof TeacherSalaryRecord>;

export const TeacherSalaryListQuery = PageQuery.extend({
  teacherId: TeacherId.optional(),
  month: ISOMonth.optional(),
  status: TxnStatusEnum.optional(),
  sortBy: z.enum(['month', 'finalAmount', 'paidAt']).optional(),
});
export type TeacherSalaryListQuery = z.infer<typeof TeacherSalaryListQuery>;

export const CreateTeacherSalaryBody = z.object({
  teacherId: TeacherId,
  month: ISOMonth,
  amount: z
    .number({ message: 'Amount must be a number.' })
    .positive('Amount must be a positive number.')
    .optional(),
});
export type CreateTeacherSalaryBody = z.infer<typeof CreateTeacherSalaryBody>;

export const UpdateTeacherSalaryBody = z.object({
  month: ISOMonth.optional(),
  amount: z
    .number({ message: 'Amount must be a number.' })
    .positive('Amount must be a positive number.')
    .optional(),
});
export type UpdateTeacherSalaryBody = z.infer<typeof UpdateTeacherSalaryBody>;

export const adminTeacherSalaryContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/finance/teacher-salary',
    query: TeacherSalaryListQuery,
    response: paginatedResponse(TeacherSalaryRecord),
  },
  detail: {
    method: 'GET',
    path: '/admin/finance/teacher-salary/:salaryId',
    params: z.object({ salaryId: ObjectId }),
    response: TeacherSalaryRecord,
  },
  create: {
    method: 'POST',
    path: '/admin/finance/teacher-salary',
    body: CreateTeacherSalaryBody,
    response: TeacherSalaryRecord,
    successStatus: 201,
  },
  update: {
    method: 'PUT',
    path: '/admin/finance/teacher-salary/:salaryId',
    params: z.object({ salaryId: ObjectId }),
    body: UpdateTeacherSalaryBody,
    response: TeacherSalaryRecord,
    successStatus: 202,
  },
  updateStatus: {
    method: 'PUT',
    path: '/admin/finance/teacher-salary/:salaryId/status',
    params: z.object({ salaryId: ObjectId }),
    body: UpdateStatusBody,
    response: TeacherSalaryRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/finance/teacher-salary/:salaryId',
    params: z.object({ salaryId: ObjectId }),
    response: DeleteFeeResponse,
    successStatus: 202,
  },
} as const);

// ---- General ledger transactions ------------------------------------------

export const TransactionRecord = z.object({
  id: ObjectId,
  title: z.string(),
  finalAmount: z.number(),
  status: TxnStatusEnum,
  category: TxnCategoryEnum,
  // Free-text sub-label for a manually-logged expense (books, whiteboards, ...) — see the doc
  // comment on `Transaction.expenseCategory` in schema.prisma. Null for Fee/Salary/anything not
  // logged through the expense flow.
  expenseCategory: z.string().nullable(),
  createdAt: ISODate,
});
export type TransactionRecord = z.infer<typeof TransactionRecord>;

export const TransactionListQuery = z.object({
  category: TxnCategoryEnum.optional(),
  status: TxnStatusEnum.optional(),
});
export type TransactionListQuery = z.infer<typeof TransactionListQuery>;

// A "log an expense" submission is a `CreateTransactionBody` where `category` is typically
// `'Other'` and `expenseCategory` carries whatever the admin/finance user typed into the category
// combobox — not restricted to a fixed list (ALIGNMENT_PLAN.md P4). `category` stays required
// (Utility/Infrastructure remain valid presets a user can also just pick) since it still drives the
// existing category-split analytics; `expenseCategory` is the free-form layer on top of it.
export const CreateTransactionBody = z.object({
  title: z
    .string({ message: 'Title is required.' })
    .min(2, 'Title must be at least 2 characters long.'),
  finalAmount: z
    .number({ message: 'Amount is required.' })
    .positive('Amount must be a positive number.'),
  category: TxnCategoryEnum,
  expenseCategory: z.string().trim().min(1).optional(),
  status: TxnStatusEnum.optional(),
});
export type CreateTransactionBody = z.infer<typeof CreateTransactionBody>;

export const UpdateTransactionBody = CreateTransactionBody.partial();
export type UpdateTransactionBody = z.infer<typeof UpdateTransactionBody>;

export const ExpenseCategoriesResponse = z.array(z.string());

export const adminTransactionContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/finance/transaction',
    query: TransactionListQuery,
    response: z.array(TransactionRecord),
  },
  detail: {
    method: 'GET',
    path: '/admin/finance/transaction/:transactionId',
    params: z.object({ transactionId: ObjectId }),
    response: TransactionRecord,
  },
  create: {
    method: 'POST',
    path: '/admin/finance/transaction',
    body: CreateTransactionBody,
    response: TransactionRecord,
    successStatus: 201,
  },
  update: {
    method: 'PUT',
    path: '/admin/finance/transaction/:transactionId',
    params: z.object({ transactionId: ObjectId }),
    body: UpdateTransactionBody,
    response: TransactionRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/finance/transaction/:transactionId',
    params: z.object({ transactionId: ObjectId }),
    response: DeleteFeeResponse,
    successStatus: 202,
  },
  expenseCategories: {
    method: 'GET',
    path: '/admin/finance/transaction/expense-categories',
    response: ExpenseCategoriesResponse,
    summary:
      'Distinct `expenseCategory` values already in use, for the category combobox — lets a user pick a previously-typed label (e.g. "Books") instead of retyping it, without restricting them to a fixed list.',
  },
} as const);

// ---- Finance audit log -------------------------------------------------------

export const FinanceAuditLogRecord = z.object({
  id: ObjectId,
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  actorUsername: z.string(),
  before: z.unknown().nullable(),
  after: z.unknown().nullable(),
  note: z.string().nullable(),
  createdAt: ISODate,
});
export type FinanceAuditLogRecord = z.infer<typeof FinanceAuditLogRecord>;

export const FinanceAuditLogQuery = PageQuery.extend({
  entityType: z.enum(['StudentFee', 'TeacherSalary', 'Transaction']).optional(),
  entityId: ObjectId.optional(),
});
export type FinanceAuditLogQuery = z.infer<typeof FinanceAuditLogQuery>;

export const adminFinanceAuditLogContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/finance/audit-log',
    query: FinanceAuditLogQuery,
    response: paginatedResponse(FinanceAuditLogRecord),
  },
} as const);
