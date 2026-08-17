import { Router } from 'express';
import {
  createStudentFee,
  deleteStudentFee,
  getStudentFeeDetail,
  getStudentFees,
  updateStudentFeeStatus,
} from '../controllers/studentFee.controller';
import {
  createTeacherSalary,
  deleteTeacherSalary,
  getTeacherSalaries,
  getTeacherSalaryDetail,
  updateTeacherSalaryStatus,
} from '../controllers/teacherSalary.controller';
import {
  createTransaction,
  deleteTransaction,
  getTransactionDetail,
  getTransactions,
  updateTransaction,
} from '../controllers/transaction.controller';

export const financeRouter = Router();

// Student fees
financeRouter.get('/student-fee', getStudentFees);
financeRouter.get('/student-fee/:feeId', getStudentFeeDetail);
financeRouter.post('/student-fee', createStudentFee);
financeRouter.put('/student-fee/:feeId/status', updateStudentFeeStatus);
financeRouter.delete('/student-fee/:feeId', deleteStudentFee);

// Teacher salaries
financeRouter.get('/teacher-salary', getTeacherSalaries);
financeRouter.get('/teacher-salary/:salaryId', getTeacherSalaryDetail);
financeRouter.post('/teacher-salary', createTeacherSalary);
financeRouter.put('/teacher-salary/:salaryId/status', updateTeacherSalaryStatus);
financeRouter.delete('/teacher-salary/:salaryId', deleteTeacherSalary);

// General ledger transactions (Utility / Infrastructure / Other)
financeRouter.get('/transaction', getTransactions);
financeRouter.get('/transaction/:transactionId', getTransactionDetail);
financeRouter.post('/transaction', createTransaction);
financeRouter.put('/transaction/:transactionId', updateTransaction);
financeRouter.delete('/transaction/:transactionId', deleteTransaction);
