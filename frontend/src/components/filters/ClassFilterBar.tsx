import type { ClassFilter } from '@/hooks/useClassFilter';
import { monthLabel } from '@/lib/session';
import { FILTER_LABEL_CLASS, FILTER_SELECT_CLASS } from './styles';

interface ClassFilterBarProps {
  filter: ClassFilter;
  /** Hide the session select when the page already picks the session elsewhere. */
  showSession?: boolean;
  showClass?: boolean;
  showSection?: boolean;
  showMonth?: boolean;
  /** Let class/section be left empty, meaning "all classes"/"all sections". */
  allowAllClasses?: boolean;
  /** Add a "Whole session" month choice — the filter's `month` is then `''`. */
  allowWholeSession?: boolean;
  /** No visible labels (screen-reader labels only) — for a table toolbar. */
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function Field({
  label,
  compact,
  children,
}: {
  label: string;
  compact: boolean;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className={compact ? 'sr-only' : FILTER_LABEL_CLASS}>{label}</span>
      {children}
    </label>
  );
}

/** The filter row for `useClassFilter` — always laid out Session → Class → Section → Month. */
export function ClassFilterBar({
  filter,
  showSession = true,
  showClass = true,
  showSection = true,
  showMonth = false,
  allowAllClasses = false,
  allowWholeSession = false,
  compact = false,
  className = '',
  children,
}: ClassFilterBarProps) {
  const noClasses = !filter.classesLoading && filter.classNameOptions.length === 0;
  return (
    <div
      data-print-hide
      className={`flex flex-wrap items-end ${compact ? 'gap-2' : 'gap-3'} ${className}`}
    >
      {showSession && (
        <Field label="Session" compact={compact}>
          <select
            value={filter.session}
            onChange={(e) => filter.setSession(e.target.value)}
            className={FILTER_SELECT_CLASS}
          >
            {filter.sessionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
      )}
      {showClass && (
        <Field label="Class" compact={compact}>
          <select
            value={filter.className}
            onChange={(e) => filter.setClassName(e.target.value)}
            disabled={filter.classesLoading || noClasses}
            className={FILTER_SELECT_CLASS}
          >
            <option value="">
              {noClasses ? 'No classes' : allowAllClasses ? 'All classes' : 'Select class…'}
            </option>
            {filter.classNameOptions.map((opt) => (
              <option key={opt} value={opt}>
                Class {opt}
              </option>
            ))}
          </select>
        </Field>
      )}
      {showClass && showSection && (
        <Field label="Section" compact={compact}>
          <select
            value={filter.section}
            onChange={(e) => filter.setSection(e.target.value)}
            disabled={!filter.className}
            className={FILTER_SELECT_CLASS}
          >
            <option value="">{allowAllClasses ? 'All sections' : 'Select section…'}</option>
            {filter.sectionOptions.map((opt) => (
              <option key={opt} value={opt}>
                Section {opt}
              </option>
            ))}
          </select>
        </Field>
      )}
      {showMonth && (
        <Field label="Month" compact={compact}>
          <select
            value={filter.month}
            onChange={(e) => filter.setMonth(e.target.value)}
            className={FILTER_SELECT_CLASS}
          >
            {allowWholeSession && <option value="">Whole session</option>}
            {filter.monthOptions.map((opt) => (
              <option key={opt} value={opt}>
                {monthLabel(opt)}
              </option>
            ))}
          </select>
        </Field>
      )}
      {children}
    </div>
  );
}
