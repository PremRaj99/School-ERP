import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ExpenseManager } from '@/components/finance/ExpenseManager';
import { financeService } from '@/lib/services/finance.service';
import { qk } from '@/lib/query-keys';

export const FinanceExpenses: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Expenses</h1>
          <Badge variant="outline" className="text-xs">
            General Ledger
          </Badge>
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Log spend on books, whiteboards, supplies, utilities, or anything else the school buys.
        </p>
      </div>

      <ExpenseManager
        adapter={{
          list: () => financeService.getExpenses(),
          create: (body) => financeService.createExpense(body),
          update: (id, body) => financeService.updateExpense(id, body),
          remove: (id) => financeService.deleteExpense(id),
          categories: () => financeService.getExpenseCategories(),
          listQueryKey: qk.finance.expenses(),
          categoriesQueryKey: qk.finance.expenseCategories(),
        }}
      />
    </div>
  );
};

export default FinanceExpenses;
