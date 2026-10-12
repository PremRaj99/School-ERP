import { useMemo } from 'react';
import { useSessionOptions } from '@/hooks/options/useAdminOptions';
import { dateToIsoDate } from '@/lib/date';
import { defaultMonth, monthLabel, sessionMonths, sessionOfDate } from '@/lib/session';
import { FILTER_LABEL_CLASS, FILTER_SELECT_CLASS } from './styles';

interface SessionMonthPickerProps {
  /** `YYYY-MM`. The session shown is the one this month falls in. */
  value: string;
  onChange: (month: string) => void;
  /** Lock the picker to this session (chosen elsewhere on the page) and show only the month. */
  session?: string;
  /** Hide months after the current one (and sessions that haven't started yet). */
  noFuture?: boolean;
  /** No visible labels (screen-reader labels only) — for a header or toolbar. */
  compact?: boolean;
  className?: string;
}

/**
 * Session → Month dropdowns in place of a raw `<input type="month">`, so a month can only be
 * picked inside an academic session (April → March). Changing the session jumps to that
 * session's current month, or its first month.
 */
export function SessionMonthPicker({
  value,
  onChange,
  session: lockedSession,
  noFuture = false,
  compact = false,
  className = '',
}: SessionMonthPickerProps) {
  const thisMonth = dateToIsoDate(new Date()).slice(0, 7);
  const allSessions = useSessionOptions();
  const sessionOptions = noFuture
    ? allSessions.filter((opt) => sessionMonths(opt.value)[0] <= thisMonth)
    : allSessions;
  const session = lockedSession ?? sessionOfDate(value);
  const months = useMemo(
    () => sessionMonths(session).filter((m) => !noFuture || m <= thisMonth),
    [session, noFuture, thisMonth],
  );
  const labelClass = compact ? 'sr-only' : FILTER_LABEL_CLASS;

  return (
    <div data-print-hide className={`flex items-end gap-2 ${className}`}>
      {!lockedSession && (
        <label>
          <span className={labelClass}>Session</span>
          <select
            value={session}
            onChange={(e) => onChange(defaultMonth(e.target.value))}
            className={FILTER_SELECT_CLASS}
          >
            {sessionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <label>
        <span className={labelClass}>Month</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={FILTER_SELECT_CLASS}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
