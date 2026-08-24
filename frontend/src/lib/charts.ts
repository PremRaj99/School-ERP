/**
 * One shared theme for every chart in the app (ALIGNMENT_PLAN.md Part 4's "Implementation note") —
 * a single categorical palette + tooltip style, so the Analytics pages read as one system instead
 * of each chart being individually styled. Matches the palette already used ad hoc in
 * `Admin/pages/Dashboard.tsx`'s attendance donut.
 */

/**
 * Monotone categorical palette — a sequential ramp of the single brand blue (#000075), from
 * darkest to lightest, for charts with several series that carry no inherent status meaning.
 * Charts where color *is* meaningful (grades, attendance, transaction status) use the semantic
 * maps below instead, not this ramp.
 */
export const CHART_COLORS = [
  '#000075', // brand
  '#1c1e89',
  '#393c9c',
  '#555ab0',
  '#7278c3',
  '#8e96d7',
  '#aab4eb',
  '#c7d2fe',
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
