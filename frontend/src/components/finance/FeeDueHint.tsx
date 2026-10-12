import { isoToDisplayDate } from '@/lib/date';
import { formatRupees } from '@/lib/finance-format';

/** Under an unpaid fee's amount: its due date, and the late fine owed today if it's overdue. */
export function FeeDueHint({
  status,
  dueDate,
  lateFine,
}: {
  status: string;
  dueDate?: string;
  lateFine: number;
}) {
  if (status === 'Paid' || status === 'NotGenerated') return null;
  return (
    <div className="text-[10px] leading-tight">
      {lateFine > 0 ? (
        <span className="font-semibold text-rose-600 dark:text-rose-400">
          Overdue · +{formatRupees(lateFine)} fine
        </span>
      ) : (
        dueDate && <span className="text-muted-foreground">Due {isoToDisplayDate(dueDate)}</span>
      )}
    </div>
  );
}
