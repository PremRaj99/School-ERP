/**
 * Display-only date formatting. The wire format is always ISO (`YYYY-MM-DD` / `YYYY-MM`,
 * ALIGNMENT_PLAN.md 2B/N1) — these helpers exist so a page can show the school's familiar
 * `DD-MM-YYYY` without ever sending or parsing that format over the network.
 */

/** "2026-08-23" -> "23-08-2026". Returns the input unchanged if it isn't a plain ISO date. */
export const isoToDisplayDate = (iso: string | null | undefined): string => {
  if (!iso) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
};

/** "23-08-2026" -> "2026-08-23". Returns the input unchanged if it isn't `DD-MM-YYYY`. */
export const displayToIsoDate = (display: string | null | undefined): string => {
  if (!display) return '';
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(display);
  if (!match) return display;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
};

/** Date -> "2026-08-23", for feeding a native `<input type="date">` value. */
export const dateToIsoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** `"09:30"`, `"12:30"` -> `"9:30 AM – 12:30 PM"`; no start time -> `''` (not set yet). */
export const formatTimeRange = (start: string | null, end: string | null): string => {
  if (!start) return '';
  const fmt = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  };
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
};
