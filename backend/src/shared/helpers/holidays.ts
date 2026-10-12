import prisma from '@/core/db';
import { ValidationError } from '@/core/errors';
import { fromISODate, toISODate } from './isoDate';

/**
 * Non-working days: every Sunday, plus every `AcademicCalendar` entry with category `HOLIDAY`.
 * Attendance can't be marked on one, and one never counts as a working day in an attendance %.
 */

/** Every holiday between `fromIso` and `toIso` (inclusive), as ISO date -> reason. */
export async function getHolidays(fromIso: string, toIso: string): Promise<Map<string, string>> {
  const from = fromISODate(fromIso);
  const to = fromISODate(toIso);
  const holidays = new Map<string, string>();

  for (const day = new Date(from); day <= to; day.setUTCDate(day.getUTCDate() + 1)) {
    if (day.getUTCDay() === 0) holidays.set(toISODate(day), 'Sunday');
  }

  const events = await prisma.academicCalendar.findMany({
    where: { category: 'HOLIDAY', date: { gte: from, lte: to } },
    orderBy: { date: 'asc' },
    select: { date: true, title: true },
  });
  for (const event of events) {
    const iso = toISODate(event.date);
    const existing = holidays.get(iso);
    // A named holiday wins over plain "Sunday"; two named ones on the same day are joined.
    holidays.set(
      iso,
      existing && existing !== 'Sunday' ? `${existing}, ${event.title}` : event.title,
    );
  }
  return holidays;
}

/** Throws a 400 if `isoDate` is a holiday, naming it — call before marking any attendance. */
export async function assertWorkingDay(isoDate: string): Promise<void> {
  const reason = (await getHolidays(isoDate, isoDate)).get(isoDate);
  if (reason) {
    throw new ValidationError(`${isoDate} is a holiday (${reason}) — attendance can't be marked.`);
  }
}
