import { dateToIsoDate } from '@/lib/date';

/**
 * Academic-session and month helpers. A session is `YYYY-YYYY` and runs April → March, mirroring
 * the backend's `getCurrentSessionYear()` — keep the two in step.
 */

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** The session an ISO `YYYY-MM-DD` (or `YYYY-MM`) date falls in. */
export function sessionOfDate(isoDate: string): string {
  const [year, month] = isoDate.split('-').map(Number);
  const start = month >= 4 ? year : year - 1;
  return `${start}-${start + 1}`;
}

/** The session today falls in. */
export function getCurrentSessionYear(): string {
  return sessionOfDate(dateToIsoDate(new Date()));
}

/** Every selectable session, newest first: next session down to 2023-2024. */
export function sessionList(): string[] {
  const currentStart = Number(getCurrentSessionYear().slice(0, 4));
  const minStart = 2023;
  const sessions: string[] = [];
  for (let year = currentStart + 1; year >= minStart; year--) {
    sessions.push(`${year}-${year + 1}`);
  }
  return sessions;
}

/** The 12 months of a session as `YYYY-MM`, April first. */
export function sessionMonths(session: string): string[] {
  const start = Number(session.slice(0, 4));
  return Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (3 + i) % 12;
    const year = i < 9 ? start : start + 1;
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  });
}

/** `2026-10` → `October 2026`. */
export function monthLabel(ym: string): string {
  const [year, month] = ym.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** First and last day of a `YYYY-MM` month as ISO dates. */
export function monthRange(ym: string): { from: string; to: string } {
  const [year, month] = ym.split('-').map(Number);
  return {
    from: dateToIsoDate(new Date(year, month - 1, 1)),
    to: dateToIsoDate(new Date(year, month, 0)),
  };
}

/** First and last day of a whole session as ISO dates (1 April → 31 March). */
export function sessionRange(session: string): { from: string; to: string } {
  const months = sessionMonths(session);
  return { from: monthRange(months[0]).from, to: monthRange(months[11]).to };
}

/** Every ISO date of a `YYYY-MM` month. */
export function monthDays(ym: string): string[] {
  const [year, month] = ym.split('-').map(Number);
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => dateToIsoDate(new Date(year, month - 1, i + 1)));
}

/** The current month if it falls inside `session`, otherwise the session's first month. */
export function defaultMonth(session: string): string {
  const months = sessionMonths(session);
  const current = dateToIsoDate(new Date()).slice(0, 7);
  return months.includes(current) ? current : months[0];
}

/** Pre-primary classes come first, in this order; anything else numeric sorts after them. */
const PRE_PRIMARY = ['playgroup', 'pg', 'nursery', 'lkg', 'ukg', 'kg'];

/**
 * Orders class names the way a school lists them — Nursery, LKG, UKG, 1, 2 … 12 — instead of
 * plain string order (`1, 10, 11, 2, LKG`).
 */
export function compareClassName(a: string, b: string): number {
  const rank = (name: string) => {
    const i = PRE_PRIMARY.indexOf(name.trim().toLowerCase());
    return i === -1 ? PRE_PRIMARY.length : i;
  };
  return rank(a) - rank(b) || a.localeCompare(b, undefined, { numeric: true });
}

/** Sort class-section rows by class name (school order), then section. */
export function compareClassSection(
  a: { className: string; section: string },
  b: { className: string; section: string },
): number {
  return compareClassName(a.className, b.className) || a.section.localeCompare(b.section);
}

/** This month as `YYYY-MM`, in local time (not UTC — `toISOString()` is a month behind just after
 * midnight on the 1st in IST). */
export function currentMonth(): string {
  return dateToIsoDate(new Date()).slice(0, 7);
}
