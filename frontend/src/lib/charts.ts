/**
 * One shared theme for every chart in the app (ALIGNMENT_PLAN.md Part 4's "Implementation note") —
 * a single categorical palette + tooltip style, so the Analytics pages read as one system instead
 * of each chart being individually styled. Matches the palette already used ad hoc in
 * `Admin/pages/Dashboard.tsx`'s attendance donut.
 */

/** Accessible categorical palette, in preferred order for a chart with several series. */
export const CHART_COLORS = [
  '#4f46e5', // indigo-600
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#f43f5e', // rose-500
  '#0ea5e9', // sky-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
  '#64748b', // slate-500
] as const;

export const chartTooltipStyle = {
  backgroundColor: 'rgba(18, 20, 29, 0.9)',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '11px',
  border: 'none',
} as const;

/** Consistent grade colors across every academics chart. */
export const GRADE_COLORS: Record<string, string> = {
  'A+': '#059669',
  A: '#10b981',
  'B+': '#0ea5e9',
  B: '#38bdf8',
  C: '#f59e0b',
  D: '#f97316',
  F: '#f43f5e',
};

/** Consistent Present/Absent/Leave colors across every attendance chart. */
export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  Present: '#10b981',
  Absent: '#f43f5e',
  Leave: '#f59e0b',
};

/** Consistent Paid/Pending/Failed colors across every finance chart. */
export const TXN_STATUS_COLORS: Record<string, string> = {
  Paid: '#10b981',
  Pending: '#f59e0b',
  Failed: '#f43f5e',
};
