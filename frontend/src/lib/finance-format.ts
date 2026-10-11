export const SCHOOL_NAME = 'Gyandeep Bal Vikas Vidyamandir';

/** Formatting helpers shared by the finance monthly-status views and per-person summary. */

export const formatRupees = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

/** "2026-08" -> "Aug 2026". */
export const formatMonth = (isoMonth: string): string => {
  const [year, month] = isoMonth.split('-').map(Number);
  return new Date(year!, month! - 1, 1).toLocaleString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
};

/** Current local month as "YYYY-MM". */
export const currentISOMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const selectClass =
  'h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900';
