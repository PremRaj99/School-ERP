import type { PaymentMode } from '@schoolerp/contracts';

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

export const PAYMENT_MODE_LABEL: Record<PaymentMode, string> = {
  Cash: 'Cash',
  UPI: 'UPI',
  Cheque: 'Cheque',
  BankTransfer: 'Bank Transfer',
  Card: 'Card',
  Online: 'Online',
};

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

/** 0–999 in words ("" for 0). */
const belowThousand = (n: number): string => {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const restWords = rest < 20 ? ONES[rest]! : `${TENS[Math.floor(rest / 10)]} ${ONES[rest % 10]}`;
  return [hundreds ? `${ONES[hundreds]} Hundred` : '', restWords.trim()].filter(Boolean).join(' ');
};

/**
 * Rupee amount in words, Indian numbering — 125450.5 -> "Rupees One Lakh Twenty Five Thousand Four
 * Hundred Fifty and Fifty Paise Only".
 */
export const amountInWords = (amount: number): string => {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  const parts: string[] = [];
  const crore = Math.floor(rupees / 10_000_000);
  const lakh = Math.floor((rupees % 10_000_000) / 100_000);
  const thousand = Math.floor((rupees % 100_000) / 1000);
  const rest = rupees % 1000;
  if (crore) parts.push(`${belowThousand(crore)} Crore`); // fees never reach 1000 crore
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));
  const words = parts.join(' ') || 'Zero';
  return `Rupees ${words}${paise ? ` and ${belowThousand(paise)} Paise` : ''} Only`;
};
