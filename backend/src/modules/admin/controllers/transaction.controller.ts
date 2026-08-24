import { adminTransactionContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminTransactionService } from '../services/transaction.service';

export const getTransactions = defineRoute(adminTransactionContract.list, async ({ query }) => {
  return AdminTransactionService.getTransactions(query);
});

export const getTransactionDetail = defineRoute(
  adminTransactionContract.detail,
  async ({ params }) => {
    return AdminTransactionService.getTransactionById(params.transactionId);
  },
);

export const createTransaction = defineRoute(adminTransactionContract.create, async ({ body }) => {
  return AdminTransactionService.createTransaction(body);
});

export const updateTransaction = defineRoute(
  adminTransactionContract.update,
  async ({ params, body }) => {
    return AdminTransactionService.updateTransaction(params.transactionId, body);
  },
);

export const deleteTransaction = defineRoute(
  adminTransactionContract.remove,
  async ({ params }) => {
    return AdminTransactionService.deleteTransaction(params.transactionId);
  },
);

export const getExpenseCategories = defineRoute(
  adminTransactionContract.expenseCategories,
  async () => {
    return AdminTransactionService.getExpenseCategories();
  },
);
