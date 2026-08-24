import express from 'express';
import { verifyJWT, FinanceOnly } from '@/core/middlewares/auth.middleware';
import { getFinanceDashboard } from '../controllers/dashboard.controller';
import { getFinanceAnalytics } from '../controllers/analytics.controller';
import { getStudentsForFinance, getTeachersForFinance } from '../controllers/directory.controller';
import { financeStudentFeeRouter } from './studentFee.route';
import { financeTeacherSalaryRouter } from './teacherSalary.route';
import { financeExpenseRouter } from './expense.route';

const financeRouter = express.Router();

financeRouter.use(verifyJWT);
financeRouter.use(FinanceOnly);

financeRouter.get('/dashboard', getFinanceDashboard);
financeRouter.get('/analytics', getFinanceAnalytics);
financeRouter.get('/student', getStudentsForFinance);
financeRouter.get('/teacher', getTeachersForFinance);

financeRouter.use('/fee', financeStudentFeeRouter);
financeRouter.use('/salary', financeTeacherSalaryRouter);
financeRouter.use('/expense', financeExpenseRouter);

export { financeRouter };
