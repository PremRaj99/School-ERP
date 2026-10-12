import { z } from 'zod';
import { defineContract } from '../envelope';

/**
 * School-wide fee rules: when a month's fee falls due, and the late fine charged after that.
 * One settings document for the whole school; until an admin saves it, `DEFAULT_FEE_SETTINGS`
 * applies (due on the 10th, no fine).
 */

export const LateFineTypeEnum = z.enum(['None', 'Flat', 'PerDay']);
export type LateFineType = z.infer<typeof LateFineTypeEnum>;

export const FeeSettings = z
  .object({
    /** Day of the fee's own month it falls due (capped at 28 so every month has it). */
    dueDay: z.number().int().min(1, 'Due day must be 1–28.').max(28, 'Due day must be 1–28.'),
    lateFineType: LateFineTypeEnum,
    /** Flat: charged once when overdue. PerDay: charged per day overdue. */
    lateFineAmount: z.number().min(0, 'Fine cannot be negative.'),
    /** Upper limit on a PerDay fine; null = no limit. */
    lateFineCap: z.number().min(0, 'Cap cannot be negative.').nullable(),
  })
  .refine((s) => s.lateFineType === 'None' || s.lateFineAmount > 0, {
    message: 'Enter the fine amount.',
    path: ['lateFineAmount'],
  });
export type FeeSettings = z.infer<typeof FeeSettings>;

export const DEFAULT_FEE_SETTINGS: FeeSettings = {
  dueDay: 10,
  lateFineType: 'None',
  lateFineAmount: 0,
  lateFineCap: null,
};

/** "2026-05" + due day 10 -> "2026-05-10". */
export const feeDueDate = (settings: FeeSettings, isoMonth: string): string =>
  `${isoMonth}-${String(settings.dueDay).padStart(2, '0')}`;

/** Whole days from ISO date `from` to ISO date `to` (negative if `to` is earlier). */
const daysBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/**
 * Late fine for a fee of `isoMonth` settled (or still unpaid) on ISO date `onDate`: 0 on or
 * before the due date, otherwise the flat amount, or the per-day amount × days late up to the cap.
 */
export const lateFineFor = (settings: FeeSettings, isoMonth: string, onDate: string): number => {
  if (settings.lateFineType === 'None') return 0;
  const daysLate = daysBetween(feeDueDate(settings, isoMonth), onDate);
  if (daysLate <= 0) return 0;
  if (settings.lateFineType === 'Flat') return settings.lateFineAmount;
  const fine = settings.lateFineAmount * daysLate;
  return settings.lateFineCap !== null ? Math.min(fine, settings.lateFineCap) : fine;
};

/** The breakdown line a charged late fine is recorded as. */
export const LATE_FINE_FEE_TYPE = 'Late Fine';

export const adminFeeSettingsContract = defineContract({
  get: {
    method: 'GET',
    path: '/admin/finance/settings',
    response: FeeSettings,
  },
  update: {
    method: 'PUT',
    path: '/admin/finance/settings',
    body: FeeSettings,
    response: FeeSettings,
    successStatus: 202,
  },
} as const);

/** Finance staff can read the rules (to see the fine on a payment) but only Admin changes them. */
export const financeFeeSettingsContract = defineContract({
  get: {
    method: 'GET',
    path: '/finance/settings',
    response: FeeSettings,
  },
} as const);
