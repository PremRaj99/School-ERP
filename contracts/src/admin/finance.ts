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

/** How a payment was received — recorded when a fee or honorarium is marked Paid. */
export const PaymentModeEnum = z.enum(['Cash', 'UPI', 'Cheque', 'BankTransfer', 'Card', 'Online']);
export type PaymentMode = z.infer<typeof PaymentModeEnum>;

/**
 * Receipt fields on a fee. `receiptNo` is assigned the first time the fee is marked Paid
 * (`RCT/<financial year>/<serial>`) and kept if it's ever moved off Paid and back, so a number is
 * never reused or skipped. Fees paid before receipt numbers existed have `receiptNo: null`.
 */
export const FeeReceiptFields = z.object({
  receiptNo: z.string().nullable(),
  /** Actual payment date (`paidAt`, or `createdAt` for a legacy Paid fee); null unless Paid. */
  paidOn: ISODate.nullable(),
  paymentMode: PaymentModeEnum.nullable(),
  paymentRef: z.string().nullable(),
});
export type FeeReceiptFields = z.infer<typeof FeeReceiptFields>;

/**
 * Due date and late fine on a fee (see `admin/feeSettings.ts`). `lateFine` is the fine owed as of
 * today on an unpaid fee — 0 once it's paid (a fine actually charged is a "Late Fine" breakdown line).
 */
export const FeeDueFields = z.object({
  dueDate: ISODate,
  lateFine: z.number(),
});
export type FeeDueFields = z.infer<typeof FeeDueFields>;

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
  // NOTE: this is `Transaction.createdAt`, not an actual payment date (kept for compatibility). The
  // real payment date now lives in `Transaction.paidAt` and is exposed as `paidOn` on the
  // monthly-status / summary responses below.
  paidAt: ISODate,
  ...FeeReceiptFields.shape,
  ...FeeDueFields.shape,
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
  /** Fees whose month falls in this session (April -> March), whatever class the student is in now. */
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
  /**
   * "Accept fee": the money is being received right now — the fee is created and immediately
   * marked Paid (assigning its receipt number) instead of being left Pending.
   */
  payment: z
    .object({
      paymentMode: PaymentModeEnum,
      paymentRef: z.string().trim().max(60, 'Reference must be at most 60 characters.').optional(),
    })
    .optional(),
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

export const UpdateStatusBody = z.object({
  status: TxnStatusEnum,
  /** Only used when `status` is `Paid`. */
  paymentMode: PaymentModeEnum.optional(),
  /** UPI transaction id, cheque number, bank reference, ... */
  paymentRef: z.string().trim().max(60, 'Reference must be at most 60 characters.').optional(),
  /**
   * Fee only, when marking Paid: the late fine collected with it (pre-filled from the fee rules,
   * editable, 0 = waived). Added to the fee as a "Late Fine" line, so it shows on the receipt.
   */
  lateFine: z.number().min(0, 'Fine cannot be negative.').optional(),
});
export type UpdateStatusBody = z.infer<typeof UpdateStatusBody>;

export const DeleteFeeResponse = z.object({ id: ObjectId });

// ---- Monthly status / per-person summaries ----------------------------------
//
// The ledgers above only list records that exist. These answer the opposite question too: for a
// given month, who has a fee/honorarium record at all, and of those who has actually paid/been paid.
// `NotGenerated` = no StudentFee/TeacherSalary row exists for that person and month yet.

export const MonthlyPaymentStatusEnum = z.enum(['Paid', 'Pending', 'Failed', 'NotGenerated']);
export type MonthlyPaymentStatus = z.infer<typeof MonthlyPaymentStatusEnum>;

/** Filter for a monthly-status list. `Unpaid` = everything except `Paid`. */
export const MonthlyStatusFilterEnum = z.enum([
  'Paid',
  'Unpaid',
  'Pending',
  'Failed',
  'NotGenerated',
]);
export type MonthlyStatusFilter = z.infer<typeof MonthlyStatusFilterEnum>;

export const MonthlyStatusSummary = z.object({
  month: ISOMonth,
  total: z.number().int(),
  paidCount: z.number().int(),
  pendingCount: z.number().int(),
  failedCount: z.number().int(),
  notGeneratedCount: z.number().int(),
  /** Sum of `finalAmount` over Paid records. */
  paidAmount: z.number(),
  /** Sum of `finalAmount` over Pending + Failed records (NotGenerated has no amount yet). */
  outstandingAmount: z.number(),
  /** What the NotGenerated rows would bill: class fee per student / salary per teacher. */
  notGeneratedAmount: z.number(),
  /** Everything still to be paid for the month: `outstandingAmount + notGeneratedAmount`. */
  totalLeft: z.number(),
});
export type MonthlyStatusSummary = z.infer<typeof MonthlyStatusSummary>;

export function monthlyStatusResponse<T extends z.ZodTypeAny>(item: T) {
  return paginatedResponse(item).extend({ summary: MonthlyStatusSummary });
}

/** One month in a person's summary. Record fields are null when `status` is `NotGenerated`. */
export const PersonMonthEntry = z.object({
  month: ISOMonth,
  status: MonthlyPaymentStatusEnum,
  recordId: ObjectId.nullable(),
  title: z.string().nullable(),
  amount: z.number().nullable(),
  /** Real payment date when known; falls back to the record's creation date for legacy Paid rows. */
  paidOn: ISODate.nullable(),
});
export type PersonMonthEntry = z.infer<typeof PersonMonthEntry>;

export const PersonSummaryTotals = z.object({
  billed: z.number(),
  paid: z.number(),
  outstanding: z.number(),
  paidMonths: z.number().int(),
  unpaidMonths: z.number().int(),
  notGeneratedMonths: z.number().int(),
  /**
   * NotGenerated months that are already due (from admission/joining up to the current month),
   * at the person's monthly fee/salary. Future months never count.
   */
  unbilledAmount: z.number(),
  /** Everything still to be paid so far: `outstanding + unbilledAmount`. */
  totalPending: z.number(),
});
export type PersonSummaryTotals = z.infer<typeof PersonSummaryTotals>;

/** Session is April -> March, matching `getCurrentSessionYear`. Omit for the current session. */
export const PersonSummaryQuery = z.object({ session: Session.optional() });
export type PersonSummaryQuery = z.infer<typeof PersonSummaryQuery>;

// Student side

export const StudentMonthlyStatusRow = z.object({
  studentId: StudentId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  className: ClassName.optional(),
  section: Section.optional(),
  rollNo: z.number().int(),
  phone: z.string().nullable(),
  status: MonthlyPaymentStatusEnum,
  feeId: ObjectId.nullable(),
  title: z.string().nullable(),
  amount: z.number().nullable(),
  paidOn: ISODate.nullable(),
  /** Fine owed as of today on an unpaid fee for this month; 0 otherwise. */
  lateFine: z.number(),
  /** The student's class fee — what a fee for this month would be if generated now. */
  monthlyFee: z.number(),
});
export type StudentMonthlyStatusRow = z.infer<typeof StudentMonthlyStatusRow>;

export const StudentMonthlyStatusQuery = PageQuery.extend({
  month: ISOMonth,
  className: ClassName.optional(),
  section: Section.optional(),
  session: Session.optional(),
  status: MonthlyStatusFilterEnum.optional(),
});
export type StudentMonthlyStatusQuery = z.infer<typeof StudentMonthlyStatusQuery>;

export const StudentFeeSummary = z.object({
  studentId: StudentId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  className: ClassName.optional(),
  section: Section.optional(),
  rollNo: z.number().int(),
  session: Session,
  months: z.array(PersonMonthEntry),
  totals: PersonSummaryTotals,
});
export type StudentFeeSummary = z.infer<typeof StudentFeeSummary>;

/**
 * Student fees for a whole session up to `throughMonth` (the current month for the current
 * session, March for a past one): what's been paid, and everything still left — unpaid invoices
 * plus, for each student-month with no fee generated yet, the student's class fee.
 */
export const SessionFeeDues = z.object({
  session: Session,
  /** Last month counted; null for a session that hasn't started yet. */
  throughMonth: ISOMonth.nullable(),
  paidAmount: z.number(),
  outstandingAmount: z.number(),
  notGeneratedCount: z.number().int(),
  notGeneratedAmount: z.number(),
  totalLeft: z.number(),
  /** Students with anything left to pay in the session so far. */
  studentsWithDues: z.number().int(),
});
export type SessionFeeDues = z.infer<typeof SessionFeeDues>;

// Teacher side

export const TeacherMonthlyStatusRow = z.object({
  teacherId: TeacherId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  phone: z.string().nullable(),
  salaryPerMonth: z.number(),
  status: MonthlyPaymentStatusEnum,
  salaryId: ObjectId.nullable(),
  title: z.string().nullable(),
  amount: z.number().nullable(),
  paidOn: ISODate.nullable(),
});
export type TeacherMonthlyStatusRow = z.infer<typeof TeacherMonthlyStatusRow>;

export const TeacherMonthlyStatusQuery = PageQuery.extend({
  month: ISOMonth,
  status: MonthlyStatusFilterEnum.optional(),
});
export type TeacherMonthlyStatusQuery = z.infer<typeof TeacherMonthlyStatusQuery>;

export const TeacherHonorariumSummary = z.object({
  teacherId: TeacherId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  salaryPerMonth: z.number(),
  session: Session,
  months: z.array(PersonMonthEntry),
  totals: PersonSummaryTotals,
});
export type TeacherHonorariumSummary = z.infer<typeof TeacherHonorariumSummary>;

export const adminStudentFeeContract = defineContract({
  monthlyStatus: {
    method: 'GET',
    path: '/admin/finance/student-fee/monthly-status',
    query: StudentMonthlyStatusQuery,
    response: monthlyStatusResponse(StudentMonthlyStatusRow),
    summary:
      "Every student on the roster for a month (active, admitted by then, or with a fee record that month) with that month's fee status — Paid / Pending / Failed / NotGenerated — plus counts and totals.",
  },
  summary: {
    method: 'GET',
    path: '/admin/finance/student-fee/summary/:studentId',
    params: z.object({ studentId: StudentId }),
    query: PersonSummaryQuery,
    response: StudentFeeSummary,
    summary: "One student's fee status for each of the 12 months of a session.",
  },
  sessionDues: {
    method: 'GET',
    path: '/admin/finance/student-fee/session-dues',
    query: PersonSummaryQuery,
    response: SessionFeeDues,
    summary: 'Paid and still-left student fee totals for a session, up to the current month.',
  },
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
  /** Salaries whose month falls in this session (April -> March). */
  session: Session.optional(),
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
  monthlyStatus: {
    method: 'GET',
    path: '/admin/finance/teacher-salary/monthly-status',
    query: TeacherMonthlyStatusQuery,
    response: monthlyStatusResponse(TeacherMonthlyStatusRow),
    summary:
      "Every teacher (joined by that month, or with a record for it) with that month's honorarium status plus counts and totals.",
  },
  summary: {
    method: 'GET',
    path: '/admin/finance/teacher-salary/summary/:teacherId',
    params: z.object({ teacherId: TeacherId }),
    query: PersonSummaryQuery,
    response: TeacherHonorariumSummary,
    summary: "One teacher's honorarium status for each of the 12 months of a session.",
  },
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
