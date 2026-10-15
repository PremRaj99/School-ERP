import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import {
  type ClassFee,
  DEFAULT_FEE_SETTINGS,
  feeDueDate,
  lateFineFor,
  type FeeDueFields,
  type FeeSettings,
} from '@schoolerp/contracts';
import { toISODate } from './isoDate';
import { getCurrentSessionYear } from './getCurrentSessionYear';

/** The school's fee rules, or the defaults if an admin hasn't saved any yet. */
export async function getFeeSettings(): Promise<FeeSettings> {
  const row = await prisma.feeSettings.findFirst();
  if (!row) return DEFAULT_FEE_SETTINGS;
  return {
    dueDay: row.dueDay,
    lateFineType: row.lateFineType,
    lateFineAmount: row.lateFineAmount,
    lateFineCap: row.lateFineCap ?? null,
    defaultMonthlyFee: row.defaultMonthlyFee ?? DEFAULT_FEE_SETTINGS.defaultMonthlyFee,
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

/**
 * The current session's active classes, each with its own monthly fee and the fee that applies
 * (own, else default). A class belongs to one session, so a fee set this year never carries over
 * to next year's class of the same name.
 */
export async function getClassFees(): Promise<ClassFee[]> {
  const [classes, settings] = await Promise.all([
    prisma.class.findMany({
      // `{ not: true }` so a legacy class with no `isArchived` key still counts as active.
      where: { isArchived: { not: true }, session: getCurrentSessionYear() },
      select: { id: true, className: true, section: true, session: true, monthlyFee: true },
    }),
    getFeeSettings(),
  ]);
  return classes
    .map((c) => toClassFee(c, settings))
    .sort(
      (a, b) =>
        a.className.localeCompare(b.className, undefined, { numeric: true }) ||
        a.section.localeCompare(b.section),
    );
}

export async function saveClassFee(classId: string, monthlyFee: number | null): Promise<ClassFee> {
  const [updated, settings] = await Promise.all([
    prisma.class
      .update({
        where: { id: classId },
        data: { monthlyFee },
        select: { id: true, className: true, section: true, session: true, monthlyFee: true },
      })
      .catch(() => {
        throw new NotFoundError();
      }),
    getFeeSettings(),
  ]);
  return toClassFee(updated, settings);
}

const toClassFee = (
  c: {
    id: string;
    className: string;
    section: string;
    session: string;
    monthlyFee: number | null;
  },
  settings: FeeSettings,
): ClassFee => ({
  classId: c.id,
  className: c.className,
  section: c.section,
  session: c.session,
  monthlyFee: c.monthlyFee ?? null,
  effectiveFee: c.monthlyFee ?? settings.defaultMonthlyFee,
});

/** Due date and today's late fine for a fee — the fine is 0 once it's paid. */
export const dueFieldsFor = (
  settings: FeeSettings,
  isoMonth: string,
  status: 'Paid' | 'Pending' | 'Failed',
): FeeDueFields => ({
  dueDate: feeDueDate(settings, isoMonth),
  lateFine: status === 'Paid' ? 0 : lateFineFor(settings, isoMonth, toISODate(new Date())),
});
