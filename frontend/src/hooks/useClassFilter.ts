import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import {
  compareClassName,
  defaultMonth,
  getCurrentSessionYear,
  sessionList,
  sessionMonths,
} from '@/lib/session';

const ALL_SESSIONS = '';

interface Options {
  /** Start on "All sessions" instead of the current session (still the first real option). */
  allowAllSessions?: boolean;
  initialSession?: string;
  initialClassName?: string;
  initialSection?: string;
}

/**
 * State for the standard Session → Class → Section → Month filter row. Each level narrows the
 * next and resets everything below it when it changes; session defaults to the current one, month
 * to the current month (when it falls in the chosen session). Class/section options come from the
 * admin class list, scoped to the chosen session — archived classes are kept, since filtering a
 * past session is exactly when you need them.
 *
 * Admin-only: reads `/admin/class`.
 */
export function useClassFilter({
  allowAllSessions = false,
  initialSession,
  initialClassName = '',
  initialSection = '',
}: Options = {}) {
  const startSession = initialSession ?? getCurrentSessionYear();
  const [session, setSessionState] = useState(startSession);
  const [className, setClassNameState] = useState(initialClassName);
  const [pickedSection, setSection] = useState(initialSection);
  const [month, setMonth] = useState(() => defaultMonth(startSession || getCurrentSessionYear()));

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: qk.admin.classes({ includeArchived: true }),
    queryFn: () => adminService.getClasses({ includeArchived: true }),
    staleTime: 5 * 60 * 1000,
  });

  const sessionOptions = useMemo(() => {
    const all = new Set(sessionList());
    for (const c of classes ?? []) all.add(c.session);
    const sorted = Array.from(all).sort().reverse();
    const current = getCurrentSessionYear();
    const options = sorted.map((value) => ({
      value,
      label: value === current ? `${value} (Current)` : value,
    }));
    return allowAllSessions
      ? [{ value: ALL_SESSIONS, label: 'All sessions' }, ...options]
      : options;
  }, [classes, allowAllSessions]);

  const sessionClasses = useMemo(
    () => (classes ?? []).filter((c) => !session || c.session === session),
    [classes, session],
  );

  const classNameOptions = useMemo(
    () => Array.from(new Set(sessionClasses.map((c) => c.className))).sort(compareClassName),
    [sessionClasses],
  );

  const sectionOptions = useMemo(
    () =>
      Array.from(
        new Set(sessionClasses.filter((c) => c.className === className).map((c) => c.section)),
      ).sort(),
    [sessionClasses, className],
  );

  // A class with a single section needs no second click — derived, not stored, so it also
  // applies when the class list loads after the class was picked.
  const section = pickedSection || (sectionOptions.length === 1 ? sectionOptions[0] : '');

  // Only meaningful with a concrete session — "All sessions" can match several class rows.
  const selectedClass = session
    ? sessionClasses.find((c) => c.className === className && c.section === section)
    : undefined;

  const monthOptions = sessionMonths(session || getCurrentSessionYear());

  return {
    session,
    className,
    section,
    month,
    classId: selectedClass?.id ?? '',
    selectedClass,
    classes: classes ?? [],
    sessionClasses,
    classesLoading,
    sessionOptions,
    classNameOptions,
    sectionOptions,
    monthOptions,
    setSession: (value: string) => {
      setSessionState(value);
      setClassNameState('');
      setSection('');
      setMonth(defaultMonth(value || getCurrentSessionYear()));
    },
    setClassName: (value: string) => {
      setClassNameState(value);
      setSection('');
    },
    setSection,
    setMonth,
    /** Jump straight to one class-section (e.g. clicking a row in a summary table). */
    selectClass: (name: string, sec: string) => {
      setClassNameState(name);
      setSection(sec);
    },
  };
}

export type ClassFilter = ReturnType<typeof useClassFilter>;
