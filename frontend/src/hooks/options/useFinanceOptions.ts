import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MAX_PAGE_SIZE } from '@schoolerp/contracts';
import { financeService } from '@/lib/services/finance.service';
import { qk } from '@/lib/query-keys';
import type { Option } from './useAdminOptions';

const FIVE_MINUTES = 5 * 60 * 1000;

/** Student/teacher `<select>` options for the Finance role's Collect Fee / Process Salary forms —
 * can't reuse `useStudentOptions`/`useTeacherOptions` from `useAdminOptions.ts`, those hit
 * `/admin/*` which a Finance user is forbidden from (ALIGNMENT_PLAN.md P4). */
export function useFinanceStudentOptions(): Option[] {
  const { data } = useQuery({
    queryKey: qk.finance.studentDirectory(),
    queryFn: () => financeService.getStudents({ pageSize: MAX_PAGE_SIZE }),
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

export function useFinanceTeacherOptions(): Option[] {
  const { data } = useQuery({
    queryKey: qk.finance.teacherDirectory(),
    queryFn: () => financeService.getTeachers({ pageSize: MAX_PAGE_SIZE }),
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
