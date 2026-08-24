import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import type {
  CreateTransactionBody,
  TransactionListQuery,
  TransactionRecord,
  UpdateTransactionBody,
} from '@schoolerp/contracts';
import { toISODate } from '@/shared/helpers/isoDate';

const toTransactionRecord = (t: {
  id: string;
  title: string;
  finalAmount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  category: 'Utility' | 'Infrastructure' | 'Fee' | 'Salary' | 'Other';
  expenseCategory: string | null | undefined;
  createdAt: Date;
}): TransactionRecord => ({
  id: t.id,
  title: t.title,
  finalAmount: t.finalAmount,
  status: t.status,
  category: t.category,
  // `?? null` — `expenseCategory` predates this column on every Transaction created before P4, so
  // a legacy document reads back `undefined` here rather than the nullable column's absence being
  // indistinguishable from an explicit null; the response contract needs a real `null`.
  expenseCategory: t.expenseCategory ?? null,
  createdAt: toISODate(t.createdAt),
});

export class AdminTransactionService {
  static async getTransactions(filters: TransactionListQuery): Promise<TransactionRecord[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return transactions.map(toTransactionRecord);
  }

  static async getTransactionById(transactionId: string): Promise<TransactionRecord> {
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundError();
    }
    return toTransactionRecord(transaction);
  }

  static async createTransaction(data: CreateTransactionBody): Promise<TransactionRecord> {
    if (data.category === 'Fee' || data.category === 'Salary') {
      throw new ValidationError(
        'Fee and Salary transactions must be created via the student-fee / teacher-salary endpoints.',
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        title: data.title,
        finalAmount: data.finalAmount,
        category: data.category,
        expenseCategory: data.expenseCategory,
        status: data.status ?? 'Pending',
      },
    });
    return toTransactionRecord(transaction);
  }

  static async updateTransaction(
    transactionId: string,
    data: UpdateTransactionBody,
  ): Promise<TransactionRecord> {
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundError();
    }

    if (transaction.category === 'Fee' || transaction.category === 'Salary') {
      throw new ValidationError(
        'Fee and Salary transactions must be updated via the student-fee / teacher-salary endpoints.',
      );
    }

    const updated = await prisma.transaction.update({ where: { id: transactionId }, data });
    return toTransactionRecord(updated);
  }

  /** Distinct `expenseCategory` labels already in use, for the category combobox — see
   * `financeExpenseContract.expenseCategories` / `adminTransactionContract.expenseCategories`. */
  static async getExpenseCategories(): Promise<string[]> {
    const rows = await prisma.transaction.findMany({
      where: { expenseCategory: { not: null } },
      select: { expenseCategory: true },
      distinct: ['expenseCategory'],
    });
    return rows
      .map((r) => r.expenseCategory)
      .filter((c): c is string => !!c)
      .sort((a, b) => a.localeCompare(b));
  }

  static async deleteTransaction(transactionId: string): Promise<{ id: string }> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { studentFee: true, teacherSalary: true },
    });

    if (!transaction) {
      throw new NotFoundError();
    }

    if (transaction.studentFee || transaction.teacherSalary) {
      throw new ValidationError(
        'This transaction is linked to a fee/salary record; delete that record instead.',
      );
    }

    await prisma.transaction.delete({ where: { id: transactionId } });
    return { id: transactionId };
  }
}
