import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  getExpenseCategories,
  getExpenseDetail,
  getExpenses,
  updateExpense,
} from '../controllers/expense.controller';

export const financeExpenseRouter = Router();

// `/expense-categories` before `/:transactionId` — see `admin/routes/finance.route.ts` for why.
financeExpenseRouter.get('/expense-categories', getExpenseCategories);
financeExpenseRouter.get('/', getExpenses);
financeExpenseRouter.get('/:transactionId', getExpenseDetail);
financeExpenseRouter.post('/', createExpense);
financeExpenseRouter.put('/:transactionId', updateExpense);
financeExpenseRouter.delete('/:transactionId', deleteExpense);
