/**
 * ISO date (`YYYY-MM-DD`) <-> Prisma `DateTime` conversion, used by modules migrated to the
 * `@schoolerp/contracts` contract layer (ALIGNMENT_PLAN.md 2B/N1).
 *
 * Deliberately separate from `getDateString.ts`, which parses the OLD `DD-MM-YYYY` request format
 * still used by every module not yet migrated — once every module is on contracts, `getDateString`
 * goes away and this is the only date helper left.
 */

/** "2026-08-23" -> Date (UTC midnight). Assumes the string already passed `ISODate.parse`. */
export const fromISODate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!));
};

/** Date -> "2026-08-23", using the UTC calendar date (dates are always stored at UTC midnight). */
export const toISODate = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * "2026-08" -> the UTC month-start/month-end bounds, for a `date: { gte, lt }` range query.
 * Deliberately separate from `getMonthStartEnd.ts`, which parses the OLD `MM-YYYY` format — mixing
 * the two up silently swaps month and year (`"2026-08".split('-')` reversed is exactly the bug this
 * exists to avoid).
 */
export const monthStartEndFromISO = (isoMonth: string): { startDate: Date; endDate: Date } => {
  const [year, month] = isoMonth.split('-').map(Number);
  return {
    startDate: new Date(Date.UTC(year!, month! - 1, 1)),
    endDate: new Date(Date.UTC(year!, month!, 1)),
  };
};

/** Date -> "2026-08", the UTC calendar month. */
export const toISOMonth = (date: Date): string => date.toISOString().slice(0, 7);

/** "2026-08" -> the Date stored for a month-keyed row (`StudentFee.month`, `TeacherSalary.month`). */
export const fromISOMonth = (isoMonth: string): Date => new Date(`${isoMonth}-01T00:00:00.000Z`);
