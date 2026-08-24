import { financeExpenseContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminTransactionService } from '@/modules/admin/services/transaction.service';

export const getExpenses = defineRoute(financeExpenseContract.list, async ({ query }) => {
  return AdminTransactionService.getTransactions(query);
});

export const getExpenseDetail = defineRoute(financeExpenseContract.detail, async ({ params }) => {
  return AdminTransactionService.getTransactionById(params.transactionId);
});

export const createExpense = defineRoute(financeExpenseContract.create, async ({ body }) => {
  return AdminTransactionService.createTransaction(body);
});

export const updateExpense = defineRoute(
  financeExpenseContract.update,
  async ({ params, body }) => {
    return AdminTransactionService.updateTransaction(params.transactionId, body);
  },
);

export const deleteExpense = defineRoute(financeExpenseContract.remove, async ({ params }) => {
  return AdminTransactionService.deleteTransaction(params.transactionId);
});

export const getExpenseCategories = defineRoute(
  financeExpenseContract.expenseCategories,
  async () => {
    return AdminTransactionService.getExpenseCategories();
  },
);
