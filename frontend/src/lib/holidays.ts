import type { CalendarEventRecord } from '@schoolerp/contracts';

/**
 * Why `isoDate` is a non-working day — "Sunday" or the calendar HOLIDAY title(s) — or
 * `undefined` on a working day. Mirrors the backend's `shared/helpers/holidays.ts`, which is what
 * actually blocks marking; this only lets a page say so before the user tries.
 */
export function holidayOn(
  isoDate: string,
  events: Pick<CalendarEventRecord, 'date' | 'title' | 'category'>[] | undefined,
): string | undefined {
  const named = (events ?? [])
    .filter((e) => e.category === 'HOLIDAY' && e.date === isoDate)
    .map((e) => e.title);
  if (named.length) return named.join(', ');
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).getDay() === 0 ? 'Sunday' : undefined;
}
