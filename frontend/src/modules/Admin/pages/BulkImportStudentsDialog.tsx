import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { downloadCsv, parseCsv } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import type { BulkImportStudentsBody, BulkImportStudentsResponse } from '@schoolerp/contracts';
import { toast } from 'sonner';
import { UploadCloud, FileDown, CheckCircle2, XCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** One column per `CreateStudentBody` field the CSV is expected to carry — the header row must
 * use these exact names (case-insensitive, whitespace-trimmed). Optional columns may be left
 * blank. */
const REQUIRED_COLUMNS = [
  'firstName',
  'dob',
  'phone',
  'className',
  'section',
  'session',
  'dateOfAdmission',
  'rollNo',
] as const;
const ALL_COLUMNS = [
  'firstName',
  'lastName',
  'dob',
  'gender',
  'address',
  'phone',
  'fatherName',
  'motherName',
  'fatherOccupation',
  'motherOccupation',
  'studentAadhar',
  'fatherAadhar',
  'motherAadhar',
  'className',
  'section',
  'session',
  'dateOfAdmission',
  'rollNo',
  'appId',
] as const;

function rowsToPayload(rows: string[][]): {
  payload: BulkImportStudentsBody;
  parseErrors: string[];
} {
  const parseErrors: string[] = [];
  if (rows.length === 0) {
    return { payload: [], parseErrors: ['The file is empty.'] };
  }

  const header = rows[0]!.map((h) => h.trim());
  const missing = REQUIRED_COLUMNS.filter(
    (col) => !header.some((h) => h.toLowerCase() === col.toLowerCase()),
  );
  if (missing.length > 0) {
    return { payload: [], parseErrors: [`Missing required column(s): ${missing.join(', ')}`] };
  }

  const payload = rows.slice(1).map((row) => {
    const record: Record<string, unknown> = {};
    header.forEach((col, i) => {
      const key = ALL_COLUMNS.find((c) => c.toLowerCase() === col.toLowerCase());
      if (!key) return; // unrecognized column — ignore rather than fail the whole file
      const raw = (row[i] ?? '').trim();
      if (raw === '') return; // leave optional fields unset; backend validation catches required-but-blank
      record[key] = key === 'rollNo' ? Number(raw) : raw;
    });
    return record;
  });

  return { payload, parseErrors };
}

export const BulkImportStudentsDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [pendingPayload, setPendingPayload] = useState<BulkImportStudentsBody | null>(null);
  const [result, setResult] = useState<BulkImportStudentsResponse | null>(null);

  const importMutation = useMutation({
    mutationFn: (payload: BulkImportStudentsBody) => adminService.bulkImportStudents(payload),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: qk.admin.students() });
      if (data.failureCount === 0) {
        toast.success(
          `Imported ${data.successCount} student${data.successCount === 1 ? '' : 's'}.`,
        );
      } else {
        toast.warning(`Imported ${data.successCount}, ${data.failureCount} row(s) failed.`);
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const reset = () => {
    setFileName(null);
    setParseErrors([]);
    setPendingPayload(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setResult(null);
    const text = await file.text();
    const rows = parseCsv(text);
    const { payload, parseErrors: errors } = rowsToPayload(rows);
    setParseErrors(errors);
    setPendingPayload(errors.length === 0 ? payload : null);
  };

  const handleDownloadTemplate = () => {
    downloadCsv(
      'student-import-template',
      [...ALL_COLUMNS],
      [
        [
          'Aditi',
          'Sharma',
          '2012-04-15',
          'Female',
          '12 MG Road, Pune',
          '9876543210',
          'Ravi Sharma',
          'Sunita Sharma',
          'Engineer',
          'Teacher',
          '',
          '',
          '',
          '8',
          'A',
          '2025-2026',
          '2026-04-01',
          '1',
          '',
        ],
      ],
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Bulk Import Students</DialogTitle>
          <DialogDescription className="text-xs">
            Upload a CSV with one row per student. Each row is validated the same way the admission
            form is — a bad row is reported, not fatal to the rest of the file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleDownloadTemplate}
          >
            <FileDown className="mr-1.5 h-3.5 w-3.5" />
            Download CSV Template
          </Button>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:bg-slate-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800">
            <UploadCloud className="h-6 w-6 text-indigo-500" />
            <span className="text-xs font-semibold">
              {fileName ?? 'Click to choose a CSV file'}
            </span>
            <span className="text-muted-foreground text-[11px]">
              Required columns: {REQUIRED_COLUMNS.join(', ')}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
          </label>

          {parseErrors.length > 0 && (
            <div className="rounded-lg border border-rose-300/60 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/40 dark:text-rose-300">
              {parseErrors.join(' ')}
            </div>
          )}

          {pendingPayload && !result && (
            <div className="text-muted-foreground text-xs">
              {pendingPayload.length} row{pendingPayload.length === 1 ? '' : 's'} ready to import.
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {result.successCount} imported
                </span>
                {result.failureCount > 0 && (
                  <span className="flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-400">
                    <XCircle className="h-3.5 w-3.5" />
                    {result.failureCount} failed
                  </span>
                )}
              </div>
              {result.failures.length > 0 && (
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {result.failures.map((f) => (
                    <div key={f.row} className="flex items-start gap-2 text-[11px]">
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        Row {f.row + 2}
                      </Badge>
                      <span className="text-muted-foreground">{f.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs"
          >
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              type="button"
              disabled={!pendingPayload || pendingPayload.length === 0 || importMutation.isPending}
              onClick={() => pendingPayload && importMutation.mutate(pendingPayload)}
              className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
            >
              {importMutation.isPending ? 'Importing...' : 'Import Students'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportStudentsDialog;
