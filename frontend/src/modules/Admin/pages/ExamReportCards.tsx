import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PiArrowLeft, PiPrinter, PiWarning } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { ExportButton, FILTER_SELECT_CLASS } from '@/components/filters';
import { ReportCard } from '@/components/report-card/ReportCard';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';

/**
 * Every student's report card for one exam, one per printed page. "Print" prints whatever is
 * shown — the whole class, or the one student picked in the dropdown.
 */
export const AdminExamReportCards: React.FC = () => {
  const { examId = '' } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.admin.examReportCards(examId),
    queryFn: () => adminService.getExamReportCards(examId),
    enabled: !!examId,
  });

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 text-xs"
      onClick={() => navigate(`/admin/exams/${examId}`)}
    >
      <PiArrowLeft className="mr-1.5 h-3.5 w-3.5" />
      Back to Exam
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-[40rem] w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        {backButton}
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  const { exam, subjects } = data;
  const shown = studentId ? data.students.filter((s) => s.studentId === studentId) : data.students;
  const unmarked = subjects.length > 0 && data.classStrength === 0;

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="space-y-3" data-print-hide>
        {backButton}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Report Cards</h1>
            <p className="text-muted-foreground text-xs">
              {exam.title} · Class {exam.className}-{exam.section} · Session {exam.session} ·{' '}
              {data.students.length} student{data.students.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className={FILTER_SELECT_CLASS}
            >
              <option value="">All students</option>
              {data.students.map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.rollNo}. {s.firstName} {s.lastName ?? ''}
                </option>
              ))}
            </select>
            <ExportButton
              print={false}
              filename={`result-${exam.className}-${exam.section}-${exam.title}`}
              headers={[
                'Roll No',
                'Student ID',
                'Name',
                ...subjects.map((s) => `${s.subjectName} (${s.fullMarks})`),
                `Total (${subjects.reduce((sum, s) => sum + s.fullMarks, 0)})`,
                'Percentage',
                'Grade',
                'Rank',
                'Result',
                'Attendance %',
              ]}
              rows={data.students.map((s) => [
                s.rollNo,
                s.studentId,
                `${s.firstName} ${s.lastName ?? ''}`.trim(),
                ...s.marks.map((m) => m.marksObtained ?? 'AB'),
                s.totalObtained,
                s.percentage,
                s.grade,
                s.rank ?? '',
                s.result,
                s.attendance.percent,
              ])}
            />
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={shown.length === 0}
              onClick={() => window.print()}
            >
              <PiPrinter className="mr-1 h-3.5 w-3.5" />
              Print {studentId ? 'Card' : `All (${shown.length})`}
            </Button>
          </div>
        </div>
        {!exam.isResultDecleared && (
          <p className="flex items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <PiWarning className="h-4 w-4 shrink-0" />
            Results aren&apos;t published yet — these cards are marked provisional, and students
            can&apos;t see them until you publish.
          </p>
        )}
        {unmarked && (
          <p className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
            <PiWarning className="h-4 w-4 shrink-0" />
            No marks have been entered for this exam yet.
          </p>
        )}
      </div>

      {shown.length === 0 ? (
        <Empty>
          <EmptyTitle>No students</EmptyTitle>
          <EmptyDescription>This class has no students to make report cards for.</EmptyDescription>
        </Empty>
      ) : (
        <div className="space-y-6 print:space-y-0">
          {shown.map((student) => (
            <ReportCard
              key={student.studentId}
              set={data}
              student={student}
              className="break-after-page last:break-after-auto"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminExamReportCards;
