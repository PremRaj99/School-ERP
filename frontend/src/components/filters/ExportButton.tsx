import { PiDownloadSimple, PiPrinter } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { downloadCsv } from '@/components/data-table';

interface ExportButtonProps {
  /** Without `.csv` — it's added. */
  filename: string;
  headers: string[];
  rows: unknown[][];
  /** Also show a Print button (prints the page; see the `@media print` rules in index.css). */
  print?: boolean;
}

/**
 * CSV download (+ optional print) for a table that isn't a `<DataTable>` — exports exactly the
 * rows the caller passes, so apply the page's filters before handing them over.
 */
export function ExportButton({ filename, headers, rows, print = true }: ExportButtonProps) {
  return (
    <div className="flex items-center gap-1.5" data-print-hide>
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-xs"
        disabled={rows.length === 0}
        onClick={() => downloadCsv(filename, headers, rows)}
      >
        <PiDownloadSimple className="mr-1 h-3.5 w-3.5" />
        CSV
      </Button>
      {print && (
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => window.print()}>
          <PiPrinter className="mr-1 h-3.5 w-3.5" />
          Print
        </Button>
      )}
    </div>
  );
}
