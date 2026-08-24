import prisma from '@/core/db';
import type { FinanceDashboard } from '@schoolerp/contracts';
import { toISODate } from '@/shared/helpers/isoDate';

/** Deliberately its own small service rather than reusing `AdminDashboardService` — that pulls a
 * lot of non-finance data (student/teacher counts, today's teacher attendance, upcoming exams,
 * recent notices) a Finance user has no use for; this is scoped to just what the Finance landing
 * page needs (ALIGNMENT_PLAN.md P4). */
export class FinanceDashboardService {
  static async getDashboard(): Promise<FinanceDashboard> {
    const now = new Date();
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [
      pendingFees,
      pendingSalaries,
      collectedThisMonth,
      expensesThisMonth,
      recentTransactions,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { category: 'Fee', status: 'Pending' },
        _count: { _all: true },
        _sum: { finalAmount: true },
      }),
      prisma.transaction.aggregate({
        where: { category: 'Salary', status: 'Pending' },
        _count: { _all: true },
        _sum: { finalAmount: true },
      }),
      prisma.transaction.aggregate({
        where: { category: 'Fee', status: 'Paid', createdAt: { gte: monthStart } },
        _sum: { finalAmount: true },
      }),
      // Every manually-logged expense this month, regardless of category — same "has an
      // `expenseCategory` label" definition used by the finance analytics endpoint.
      prisma.transaction.aggregate({
        where: {
          expenseCategory: { not: null },
          status: { not: 'Failed' },
          createdAt: { gte: monthStart },
        },
        _sum: { finalAmount: true },
      }),
      prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    ]);

    return {
      pendingStudentFees: {
        count: pendingFees._count._all,
        totalAmount: pendingFees._sum.finalAmount ?? 0,
      },
      pendingTeacherSalaries: {
        count: pendingSalaries._count._all,
        totalAmount: pendingSalaries._sum.finalAmount ?? 0,
      },
      collectedThisMonth: collectedThisMonth._sum.finalAmount ?? 0,
      expensesThisMonth: expensesThisMonth._sum.finalAmount ?? 0,
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        title: t.title,
        finalAmount: t.finalAmount,
        status: t.status,
        category: t.category,
        expenseCategory: t.expenseCategory ?? null,
        createdAt: toISODate(t.createdAt),
      })),
    };
  }
}
