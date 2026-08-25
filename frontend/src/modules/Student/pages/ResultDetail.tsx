import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { PiArrowLeft, PiPrinter, PiChalkboardTeacher } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

export const StudentResultDetail: React.FC = () => {
  const { examId = '' } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.student.result(examId),
    queryFn: () => studentService.getResult(examId),
    enabled: !!examId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => navigate('/student/exams')}
        >
          <PiArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Examinations
        </Button>
        <ErrorState
          title={isError ? undefined : 'Result not available'}
          description={
            isError
              ? getErrorMessage(error)
              : 'This result has not been declared yet, or does not exist.'
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const totalObtained = result.marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalMax = result.marks.reduce((sum, m) => sum + m.fullMarks, 0);
  const percentage = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) : '0.0';
  const passed = result.marks.every((m) => (m.marksObtained / m.fullMarks) * 100 >= 33);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 text-xs"
          onClick={() => navigate('/student/exams')}
        >
          <PiArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Examinations
        </Button>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white"
          onClick={() => window.print()}
        >
          <PiPrinter className="h-3.5 w-3.5" />
          <span>Print Marksheet</span>
        </Button>
      </div>

      <Card className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-6 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-800/60">
        <div className="space-y-1 border-b pb-4 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 text-base font-bold text-slate-900 dark:text-white">
            <PiChalkboardTeacher className="text-primary h-5 w-5" />
            <span>Gyandeep BAAL VIKAS VIDYA MANDIR</span>
          </div>
          <p className="text-muted-foreground text-[11px]">
            Official Academic Marksheet • {result.title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-muted-foreground text-[10px]">Student Name:</span>
            <p className="font-bold">
              {result.firstName} {result.lastName || ''}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px]">Student ID / Roll:</span>
            <p className="font-mono font-bold">
              {result.studentId} (Roll #{result.rollNo})
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px]">Class & Section:</span>
            <p className="font-semibold">
              Class {result.className} - {result.section}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-[10px]">Exam Period:</span>
            <p className="font-semibold">
              {isoToDisplayDate(result.dateFrom)}
              {result.dateTo && ` – ${isoToDisplayDate(result.dateTo)}`}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-100 dark:bg-zinc-700/50">
                <TableHead className="text-[11px] font-bold">Subject</TableHead>
                <TableHead className="text-[11px] font-bold">Max</TableHead>
                <TableHead className="text-[11px] font-bold">Scored</TableHead>
                <TableHead className="text-[11px] font-bold">Grade</TableHead>
                <TableHead className="text-[11px] font-bold">Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.marks.map((m) => (
                <TableRow key={m.subjectCode}>
                  <TableCell className="p-2 text-xs font-medium">{m.subjectName}</TableCell>
                  <TableCell className="p-2 text-xs">{m.fullMarks}</TableCell>
                  <TableCell className="p-2 text-xs font-bold">{m.marksObtained}</TableCell>
                  <TableCell className="p-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {m.grade}
                  </TableCell>
                  <TableCell className="text-muted-foreground p-2 text-xs">
                    {m.remark || '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="border-primary/20 bg-primary/10 flex items-center justify-between rounded-md border p-3 text-xs">
          <div>
            <span className="text-muted-foreground text-[10px]">Final Aggregate:</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {totalObtained} / {totalMax} ({percentage}%)
            </p>
          </div>
          <div className="text-right">
            <span className="text-muted-foreground text-[10px]">Result Status:</span>
            <p
              className={`text-sm font-bold ${
                passed
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {passed ? 'PASSED' : 'NOT PASSED'}
            </p>
          </div>
        </div>
      </Card>

      {result.marks.length === 0 && (
        <Badge variant="outline" className="text-xs">
          No subject marks have been entered for this exam yet.
        </Badge>
      )}
    </div>
  );
};

export default StudentResultDetail;
