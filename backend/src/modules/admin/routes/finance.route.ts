import { Router } from 'express';
import {
  createStudentFee,
  deleteStudentFee,
  getStudentFeeDetail,
  getStudentFees,
  updateStudentFee,
  updateStudentFeeStatus,
} from '../controllers/studentFee.controller';
import {
  createTeacherSalary,
  deleteTeacherSalary,
  getTeacherSalaries,
  getTeacherSalaryDetail,
  updateTeacherSalary,
  updateTeacherSalaryStatus,
} from '../controllers/teacherSalary.controller';
import {
  createTransaction,
  deleteTransaction,
  getExpenseCategories,
  getTransactionDetail,
  getTransactions,
  updateTransaction,
} from '../controllers/transaction.controller';
import { getFinanceAuditLogs } from '../controllers/financeAuditLog.controller';

export const financeRouter = Router();

// Audit log (admin-only, read-only)
financeRouter.get('/audit-log', getFinanceAuditLogs);

// Student fees
financeRouter.get('/student-fee', getStudentFees);
financeRouter.get('/student-fee/:feeId', getStudentFeeDetail);
financeRouter.post('/student-fee', createStudentFee);
// Full edit (month, title, fee breakdown) — distinct from the status-only update below
financeRouter.put('/student-fee/:feeId/status', updateStudentFeeStatus);
financeRouter.put('/student-fee/:feeId', updateStudentFee);
financeRouter.delete('/student-fee/:feeId', deleteStudentFee);

// Teacher salaries
financeRouter.get('/teacher-salary', getTeacherSalaries);
financeRouter.get('/teacher-salary/:salaryId', getTeacherSalaryDetail);
financeRouter.post('/teacher-salary', createTeacherSalary);
// Full edit (month, amount) — distinct from the status-only update below
financeRouter.put('/teacher-salary/:salaryId/status', updateTeacherSalaryStatus);
financeRouter.put('/teacher-salary/:salaryId', updateTeacherSalary);
financeRouter.delete('/teacher-salary/:salaryId', deleteTeacherSalary);

// General ledger transactions (Utility / Infrastructure / Other)
// `/expense-categories` is registered before `/:transactionId` — both are single path segments
// under `/transaction`, and Express matches GET routes in registration order, so the param route
// would otherwise swallow this one (treating "expense-categories" as a transactionId and 400ing on
// the ObjectId format check).
financeRouter.get('/transaction/expense-categories', getExpenseCategories);
financeRouter.get('/transaction', getTransactions);
financeRouter.get('/transaction/:transactionId', getTransactionDetail);
financeRouter.post('/transaction', createTransaction);
financeRouter.put('/transaction/:transactionId', updateTransaction);
financeRouter.delete('/transaction/:transactionId', deleteTransaction);
