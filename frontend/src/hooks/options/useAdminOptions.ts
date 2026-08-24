import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MAX_PAGE_SIZE } from '@schoolerp/contracts';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';

/**
 * Every `<select>`/combobox in the admin portal should be fed from one of these instead of a
 * hand-typed `<option>` list — the whole point of "select over free text" (ALIGNMENT_PLAN.md
 * Part 3.2) is that the choices come from what the backend actually has, not from whatever the
 * page's author guessed when they wrote the form.
 */
export interface Option {
  value: string;
  label: string;
}

const FIVE_MINUTES = 5 * 60 * 1000;

/** The raw class list, shared by the className/section option hooks below so they only fetch once. */
function useAdminClasses() {
  return useQuery({
    queryKey: qk.admin.classes(),
    queryFn: () => adminService.getClasses(),
    staleTime: FIVE_MINUTES,
  });
}

/** Distinct class names across every class-section-session the school has. */
export function useClassNameOptions(): Option[] {
  const { data } = useAdminClasses();
  return useMemo(() => {
    const names = Array.from(new Set((data ?? []).map((c) => c.className)));
    return names.sort().map((name) => ({ value: name, label: `Class ${name}` }));
  }, [data]);
}

/** Sections that exist for `className` — empty (not "all sections") until a class is chosen. */
export function useSectionOptions(className: string | undefined): Option[] {
  const { data } = useAdminClasses();
  return useMemo(() => {
    if (!className) return [];
    const sections = (data ?? []).filter((c) => c.className === className).map((c) => c.section);
    return Array.from(new Set(sections))
      .sort()
      .map((section) => ({ value: section, label: `Section ${section}` }));
  }, [data, className]);
}

/**
 * Academic sessions, generated the same way the backend's `getCurrentSessionYear()` does (a
 * session starts in April) — not fetched, since picking a *new* session (e.g. for next year's
 * intake) is a normal, valid choice that no existing `Class` row would have yet.
 */
export function useSessionOptions(): Option[] {
  return useMemo(() => {
    const now = new Date();
    const currentStartYear = now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;
    const startYears = [currentStartYear - 1, currentStartYear, currentStartYear + 1];
    return startYears.map((year) => ({
      value: `${year}-${year + 1}`,
      label: `${year}-${year + 1}`,
    }));
  }, []);
}

export function useSubjectOptions(): Option[] {
  const { data } = useQuery({
    queryKey: qk.admin.subjects(),
    queryFn: () => adminService.getSubjects(),
    staleTime: FIVE_MINUTES,
  });
  return useMemo(
    () =>
      (data ?? []).map((s) => ({
        value: s.subjectCode,
        label: `${s.subjectName} (${s.subjectCode})`,
      })),
    [data],
  );
}

export function useTeacherOptions(): Option[] {
  // `pageSize: MAX_PAGE_SIZE` — a dropdown needs every teacher, not one page of the (now
  // server-paginated, ALIGNMENT_PLAN.md 2C/P1) list endpoint. Comfortably covers this school's
  // real headcount; revisit if the school ever has more than 100 teachers.
  const { data } = useQuery({
    queryKey: qk.admin.teachers({ pageSize: MAX_PAGE_SIZE }),
    queryFn: () => adminService.getTeachers({ pageSize: MAX_PAGE_SIZE }),
    staleTime: FIVE_MINUTES,
  });
  return useMemo(
    () =>
      (data?.data ?? []).map((t) => ({
        value: t.teacherId,
        label: `${t.firstName} ${t.lastName ?? ''} · ${t.teacherId}`.replace(/\s+/g, ' ').trim(),
      })),
    [data],
  );
}

/**
 * Optionally scoped to one class-section — pass nothing to list every student in the school.
 * Takes `className`/`section` as separate params rather than one `{ className, section }` object
 * so the memoization dependency is two primitives, not an object a caller might pass a fresh
 * literal for on every render.
 */
export function useStudentOptions(className?: string, section?: string): Option[] {
  const { data } = useQuery({
    queryKey: qk.admin.students({ className, section, pageSize: MAX_PAGE_SIZE }),
    queryFn: () => adminService.getStudents({ className, section, pageSize: MAX_PAGE_SIZE }),
    staleTime: FIVE_MINUTES,
  });
  return useMemo(
    () =>
      (data?.data ?? []).map((s) => ({
        value: s.studentId,
        label: `#${s.rollNo} ${s.firstName} ${s.lastName ?? ''} · ${s.studentId}`
          .replace(/\s+/g, ' ')
          .trim(),
      })),
    [data],
  );
}
