import prisma from '@/core/db';
import {
  DEFAULT_FEE_SETTINGS,
  feeDueDate,
  lateFineFor,
  type FeeDueFields,
  type FeeSettings,
} from '@schoolerp/contracts';
import { toISODate } from './isoDate';

/** The school's fee rules, or the defaults if an admin hasn't saved any yet. */
export async function getFeeSettings(): Promise<FeeSettings> {
  const row = await prisma.feeSettings.findFirst();
  if (!row) return DEFAULT_FEE_SETTINGS;
  return {
    dueDay: row.dueDay,
    lateFineType: row.lateFineType,
    lateFineAmount: row.lateFineAmount,
    lateFineCap: row.lateFineCap ?? null,
  };
}

export async function saveFeeSettings(data: FeeSettings): Promise<FeeSettings> {
  const existing = await prisma.feeSettings.findFirst({ select: { id: true } });
  const values = {
    ...data,
    // A cap only means something for a per-day fine.
    lateFineCap: data.lateFineType === 'PerDay' ? data.lateFineCap : null,
    lateFineAmount: data.lateFineType === 'None' ? 0 : data.lateFineAmount,
  };
  if (existing) {
    await prisma.feeSettings.update({ where: { id: existing.id }, data: values });
  } else {
    await prisma.feeSettings.create({ data: values });
  }
  return getFeeSettings();
}

/** Due date and today's late fine for a fee — the fine is 0 once it's paid. */
export const dueFieldsFor = (
  settings: FeeSettings,
  isoMonth: string,
  status: 'Paid' | 'Pending' | 'Failed',
): FeeDueFields => ({
  dueDate: feeDueDate(settings, isoMonth),
  lateFine: status === 'Paid' ? 0 : lateFineFor(settings, isoMonth, toISODate(new Date())),
});
