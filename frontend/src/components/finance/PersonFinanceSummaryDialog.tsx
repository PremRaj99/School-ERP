import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PiPrinter } from 'react-icons/pi';
import type { PersonMonthEntry, PersonSummaryTotals } from '@schoolerp/contracts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { useSessionOptions } from '@/hooks/options/useAdminOptions';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { printElement } from '@/lib/print';
import { MonthlyStatusBadge } from './monthlyStatus';
import { SCHOOL_NAME, formatMonth, formatRupees } from '@/lib/finance-format';

/** Who the summary is for. `null` = dialog closed. */
export type SummaryTarget =
  { kind: 'student'; studentId: string } | { kind: 'teacher'; teacherId: string };

interface NormalizedSummary {
  heading: string;
  details: { label: string; value: string }[];
  session: string;
  months: PersonMonthEntry[];
  totals: PersonSummaryTotals;
}

function useSummary(target: SummaryTarget | null, session: string | undefined) {
  return useQuery({
    enabled: !!target,
    queryKey:
      target?.kind === 'teacher'
        ? qk.admin.teacherHonorariumSummary(target.teacherId, session)
        : qk.admin.studentFeeSummary(target?.studentId ?? '', session),
    queryFn: async (): Promise<NormalizedSummary> => {
      if (target!.kind === 'student') {
        const s = await adminService.getStudentFeeSummary(target!.studentId, session);
        return {
          heading: [s.firstName, s.lastName].filter(Boolean).join(' '),
          details: [
            { label: 'Student ID', value: s.studentId },
            {
              label: 'Class',
              value: s.className ? `${s.className}${s.section ? ` - ${s.section}` : ''}` : '—',
            },
            { label: 'Roll No.', value: String(s.rollNo) },
          ],
          session: s.session,
          months: s.months,
          totals: s.totals,
        };
      }
      const t = await adminService.getTeacherHonorariumSummary(target!.teacherId, session);
      return {
        heading: [t.firstName, t.lastName].filter(Boolean).join(' '),
        details: [
          { label: 'Teacher ID', value: t.teacherId },
          { label: 'Monthly Honorarium', value: formatRupees(t.salaryPerMonth) },
        ],
        session: t.session,
        months: t.months,
        totals: t.totals,
      };
    },
  });
}

interface Props {
  target: SummaryTarget | null;
  onClose: () => void;
}

/**
 * Month-by-month fee (student) or honorarium (teacher) statement for one session, with totals and a
 * printable layout. Months with no record yet show as "Not generated".
 */
export const PersonFinanceSummaryDialog: React.FC<Props> = ({ target, onClose }) => {
  // `undefined` = let the backend pick (student's class session / current session).
  const [session, setSession] = useState<string | undefined>(undefined);
  const sessionOptions = useSessionOptions();
  const statementRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError, error, refetch } = useSummary(target, session);

  const isTeacher = target?.kind === 'teacher';
  const noun = isTeacher ? 'Honorarium' : 'Fee';

  return (
    <Dialog
      open={!!target}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
          setSession(undefined);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">
            {isTeacher ? 'Staff Honorarium Summary' : 'Student Fee Summary'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-muted-foreground flex items-center gap-2 text-xs font-semibold">
            Session
            <select
              value={session ?? data?.session ?? ''}
              onChange={(e) => setSession(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              {sessionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={!data}
            onClick={() =>
              printElement(statementRef.current, `${noun} statement - ${data?.heading ?? ''}`)
            }
          >
            <PiPrinter className="mr-1.5 h-3.5 w-3.5" />
            Print Statement
          </Button>
        </div>

        {isError ? (
          <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
        ) : isLoading || !data ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <div ref={statementRef} className="space-y-4 text-xs">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold">{SCHOOL_NAME}</h3>
                <p className="text-muted-foreground text-[11px]">
                  {noun} statement · Session {data.session}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{data.heading}</p>
                {data.details.map((d) => (
                  <p key={d.label} className="text-muted-foreground text-[11px]">
                    {d.label}: <span className="text-foreground font-medium">{d.value}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <SummaryStat
                label={isTeacher ? 'Total Due' : 'Total Billed'}
                value={formatRupees(data.totals.billed)}
              />
              <SummaryStat
                label={isTeacher ? 'Disbursed' : 'Paid'}
                value={formatRupees(data.totals.paid)}
                tone="good"
              />
              <SummaryStat
                label="Total Pending"
                value={formatRupees(data.totals.totalPending)}
                tone={data.totals.totalPending > 0 ? 'warn' : undefined}
                hint={
                  data.totals.unbilledAmount > 0
                    ? `${formatRupees(data.totals.outstanding)} billed + ${formatRupees(
                        data.totals.unbilledAmount,
                      )} not generated`
                    : undefined
                }
              />
              <SummaryStat
                label="Months"
                value={`${data.totals.paidMonths} paid · ${data.totals.unpaidMonths} unpaid`}
                hint={
                  data.totals.notGeneratedMonths > 0
                    ? `${data.totals.notGeneratedMonths} not generated`
                    : undefined
                }
              />
            </div>

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Month</th>
                    <th className="px-3 py-2 font-semibold">Description</th>
                    <th className="px-3 py-2 text-right font-semibold">Amount</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold">
                      {isTeacher ? 'Disbursed On' : 'Paid On'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.months.map((m) => (
                    <tr key={m.month} className="border-t">
                      <td className="px-3 py-2 font-medium whitespace-nowrap">
                        {formatMonth(m.month)}
                      </td>
                      <td className="text-muted-foreground px-3 py-2">{m.title ?? '—'}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">
                        {m.amount != null ? formatRupees(m.amount) : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <MonthlyStatusBadge status={m.status} />
                      </td>
                      <td className="text-muted-foreground px-3 py-2 whitespace-nowrap">
                        {m.paidOn ? isoToDisplayDate(m.paidOn) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-[10px]">
              Generated on {isoToDisplayDate(new Date().toISOString().slice(0, 10))}.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const SummaryStat: React.FC<{
  label: string;
  value: string;
  hint?: string;
  tone?: 'good' | 'warn';
}> = ({ label, value, hint, tone }) => (
  <div className="rounded-md border p-2.5">
    <p className="text-muted-foreground text-[10px] font-semibold uppercase">{label}</p>
    <p
      className={`mt-0.5 text-sm font-bold tabular-nums ${
        tone === 'good'
          ? 'text-emerald-600 dark:text-emerald-400'
          : tone === 'warn'
            ? 'text-amber-600 dark:text-amber-400'
            : ''
      }`}
    >
      {value}
    </p>
    {hint && <p className="text-muted-foreground text-[10px]">{hint}</p>}
  </div>
);
