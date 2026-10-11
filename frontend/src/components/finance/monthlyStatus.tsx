import React from 'react';
import type {
  MonthlyPaymentStatus,
  MonthlyStatusFilter,
  MonthlyStatusSummary,
} from '@schoolerp/contracts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupees } from '@/lib/finance-format';

const STATUS_STYLE: Record<MonthlyPaymentStatus, { label: string; className: string }> = {
  Paid: {
    label: 'Paid',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  Failed: {
    label: 'Failed',
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  },
  NotGenerated: {
    label: 'Not generated',
    className: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300',
  },
};

export const MonthlyStatusBadge: React.FC<{ status: MonthlyPaymentStatus }> = ({ status }) => (
  <Badge
    variant="outline"
    className={`border-0 text-[10px] font-semibold whitespace-nowrap ${STATUS_STYLE[status].className}`}
  >
    {STATUS_STYLE[status].label}
  </Badge>
);

interface SummaryCardsProps {
  summary: MonthlyStatusSummary | undefined;
  /** "students" / "staff" */
  people: string;
  paidLabel: string;
}

export const MonthlySummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  people,
  paidLabel,
}) => {
  const paidPct =
    summary && summary.total > 0 ? Math.round((summary.paidCount / summary.total) * 100) : 0;
  const unpaid = summary ? summary.total - summary.paidCount : 0;
  const cardClass =
    'border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90';
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card className={cardClass}>
        <CardContent className="p-3">
          <span className="text-muted-foreground text-[11px] font-semibold">{paidLabel}</span>
          <p className="mt-0.5 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {summary?.paidCount ?? 0}
            <span className="text-muted-foreground text-xs font-medium">
              {' '}
              / {summary?.total ?? 0} {people}
            </span>
          </p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
            <div className="h-full bg-emerald-500" style={{ width: `${paidPct}%` }} />
          </div>
        </CardContent>
      </Card>
      <Card className={cardClass}>
        <CardContent className="p-3">
          <span className="text-muted-foreground text-[11px] font-semibold">Not yet paid</span>
          <p className="mt-0.5 text-xl font-bold text-amber-600 dark:text-amber-400">{unpaid}</p>
          <span className="text-muted-foreground text-[10px]">
            {summary?.pendingCount ?? 0} pending · {summary?.failedCount ?? 0} failed ·{' '}
            {summary?.notGeneratedCount ?? 0} not generated
          </span>
        </CardContent>
      </Card>
      <Card className={cardClass}>
        <CardContent className="p-3">
          <span className="text-muted-foreground text-[11px] font-semibold">Amount received</span>
          <p className="mt-0.5 text-xl font-bold">{formatRupees(summary?.paidAmount ?? 0)}</p>
        </CardContent>
      </Card>
      <Card className={cardClass}>
        <CardContent className="p-3">
          <span className="text-muted-foreground text-[11px] font-semibold">Outstanding</span>
          <p className="mt-0.5 text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatRupees(summary?.outstandingAmount ?? 0)}
          </p>
          <span className="text-muted-foreground text-[10px]">
            Pending + failed (excludes not generated)
          </span>
        </CardContent>
      </Card>
    </div>
  );
};

const FILTERS: { value: MonthlyStatusFilter | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Unpaid', label: 'Not paid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' },
  { value: 'NotGenerated', label: 'Not generated' },
];

const countFor = (summary: MonthlyStatusSummary | undefined, filter: MonthlyStatusFilter | '') => {
  if (!summary) return undefined;
  switch (filter) {
    case '':
      return summary.total;
    case 'Paid':
      return summary.paidCount;
    case 'Unpaid':
      return summary.total - summary.paidCount;
    case 'Pending':
      return summary.pendingCount;
    case 'Failed':
      return summary.failedCount;
    case 'NotGenerated':
      return summary.notGeneratedCount;
  }
};

export const StatusFilterChips: React.FC<{
  value: MonthlyStatusFilter | '';
  onChange: (value: MonthlyStatusFilter | '') => void;
  summary: MonthlyStatusSummary | undefined;
}> = ({ value, onChange, summary }) => (
  <div className="flex flex-wrap gap-1.5">
    {FILTERS.map((f) => {
      const active = value === f.value;
      const count = countFor(summary, f.value);
      return (
        <button
          key={f.label}
          type="button"
          onClick={() => onChange(f.value)}
          className={`h-7 rounded-full border px-3 text-[11px] font-semibold transition-colors ${
            active
              ? 'border-primary bg-primary text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300'
          }`}
        >
          {f.label}
          {count != null && <span className="ml-1 opacity-75">{count}</span>}
        </button>
      );
    })}
  </div>
);
