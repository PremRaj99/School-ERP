/**
 * Shared helpers for the monthly fee/honorarium status views and per-person summaries
 * (`monthlyStatus` / `summary` operations on the admin student-fee and teacher-salary contracts).
 */
import type {
  MonthlyPaymentStatus,
  MonthlyStatusFilter,
  MonthlyStatusSummary,
  PersonMonthEntry,
  PaymentMode,
  PersonSummaryTotals,
} from '@schoolerp/contracts';
import { fromISOMonth, toISODate } from './isoDate';

type TxnStatus = 'Paid' | 'Pending' | 'Failed';

/**
 * `paidAt` value for a status change: stamp it on the transition into `Paid`, keep the existing
 * stamp if it was already `Paid`, clear it when moving off `Paid`.
 */
export const paidAtForStatus = (
  nextStatus: TxnStatus,
  previous: { status: TxnStatus; paidAt: Date | null },
): Date | null => {
  if (nextStatus !== 'Paid') return null;
  if (previous.status === 'Paid') return previous.paidAt ?? null;
  return new Date();
};

/** Payment date to show: real `paidAt`, else `createdAt` for a legacy Paid row, else null. */
export const paidOnFor = (txn: {
  status: TxnStatus;
  paidAt: Date | null;
  createdAt: Date;
}): string | null => {
  if (txn.status !== 'Paid') return null;
  return toISODate(txn.paidAt ?? txn.createdAt);
};

/** A fee's receipt fields (`FeeReceiptFields`) — all null unless it's currently Paid. */
export const receiptFieldsFor = (txn: {
  status: TxnStatus;
  paidAt: Date | null;
  createdAt: Date;
  receiptNo: string | null;
  paymentMode: PaymentMode | null;
  paymentRef: string | null;
}) => {
  const paid = txn.status === 'Paid';
  return {
    receiptNo: paid ? txn.receiptNo : null,
    paidOn: paidOnFor(txn),
    paymentMode: paid ? txn.paymentMode : null,
    paymentRef: paid ? txn.paymentRef : null,
  };
};

/** "2025-2026" -> ["2025-04", ..., "2026-03"] (sessions run April -> March). */
export const sessionMonths = (session: string): string[] => {
  const startYear = Number(session.split('-')[0]);
  return Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (3 + i) % 12; // 0-based, starting at April
    const year = startYear + (3 + i >= 12 ? 1 : 0);
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  });
};

/** Prisma `month` range for a whole session: April of its first year → March of its second. */
export const sessionMonthRange = (session: string): { gte: Date; lte: Date } => {
  const months = sessionMonths(session);
  return { gte: fromISOMonth(months[0]!), lte: fromISOMonth(months[11]!) };
};

export const matchesStatusFilter = (
  status: MonthlyPaymentStatus,
  filter: MonthlyStatusFilter | undefined,
): boolean => {
  if (!filter) return true;
  if (filter === 'Unpaid') return status !== 'Paid';
  return status === filter;
};

export const summarizeMonth = (
  month: string,
  rows: { status: MonthlyPaymentStatus; amount: number | null }[],
): MonthlyStatusSummary => {
  const summary: MonthlyStatusSummary = {
    month,
    total: rows.length,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
    notGeneratedCount: 0,
    paidAmount: 0,
    outstandingAmount: 0,
  };
  for (const row of rows) {
    if (row.status === 'Paid') {
      summary.paidCount += 1;
      summary.paidAmount += row.amount ?? 0;
    } else if (row.status === 'Pending') {
      summary.pendingCount += 1;
      summary.outstandingAmount += row.amount ?? 0;
    } else if (row.status === 'Failed') {
      summary.failedCount += 1;
      summary.outstandingAmount += row.amount ?? 0;
    } else {
      summary.notGeneratedCount += 1;
    }
  }
  return summary;
};

export const summarizePerson = (months: PersonMonthEntry[]): PersonSummaryTotals => {
  const totals: PersonSummaryTotals = {
    billed: 0,
    paid: 0,
    outstanding: 0,
    paidMonths: 0,
    unpaidMonths: 0,
    notGeneratedMonths: 0,
  };
  for (const m of months) {
    if (m.status === 'NotGenerated') {
      totals.notGeneratedMonths += 1;
      continue;
    }
    const amount = m.amount ?? 0;
    totals.billed += amount;
    if (m.status === 'Paid') {
      totals.paid += amount;
      totals.paidMonths += 1;
    } else {
      totals.outstanding += amount;
      totals.unpaidMonths += 1;
    }
  }
  return totals;
};

export const paginate = <T>(rows: T[], page: number, pageSize: number) => ({
  data: rows.slice((page - 1) * pageSize, page * pageSize),
  page,
  pageSize,
  total: rows.length,
  totalPages: Math.max(1, Math.ceil(rows.length / pageSize)),
});
