import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import { CreateTransactionInput, UpdateTransactionInput } from '../types';

export interface TransactionFilters {
  category?: 'Utility' | 'Infrastructure' | 'Fee' | 'Salary' | 'Other';
  status?: 'Paid' | 'Pending' | 'Failed';
}

export class AdminTransactionService {
  static async getTransactions(filters: TransactionFilters) {
    return await prisma.transaction.findMany({
      where: {
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getTransactionById(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundError();
    }
    return transaction;
  }

  static async createTransaction(data: CreateTransactionInput) {
    if (data.category === 'Fee' || data.category === 'Salary') {
      throw new ValidationError(
        'Fee and Salary transactions must be created via the student-fee / teacher-salary endpoints.',
      );
    }

    return await prisma.transaction.create({
      data: {
        title: data.title,
        finalAmount: data.finalAmount,
        category: data.category,
        status: data.status ?? 'Pending',
      },
    });
  }

  static async updateTransaction(transactionId: string, data: UpdateTransactionInput) {
    const transaction = await prisma.transaction.findUnique({ where: { id: transactionId } });
    if (!transaction) {
      throw new NotFoundError();
    }

    if (transaction.category === 'Fee' || transaction.category === 'Salary') {
      throw new ValidationError(
        'Fee and Salary transactions must be updated via the student-fee / teacher-salary endpoints.',
      );
    }

    await prisma.transaction.update({
      where: { id: transactionId },
      data,
    });
  }

  static async deleteTransaction(transactionId: string) {
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
  }
}
