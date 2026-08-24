import React, { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { teacherService } from '@/lib/services/teacher.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import type { ResultSheet } from '@schoolerp/contracts';
import { toast } from 'sonner';
import { PiFloppyDisk, PiMedal, PiFileDashed } from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/** Mirrors `backend/src/shared/helpers/getGrade.ts` exactly, for the live preview only — the
 * server recomputes the real grade on save, this is never sent over the wire. */
function calculateGrade(fullMarks: number, marksObtained: number): string {
  if (fullMarks <= 0) return '—';
  const pct = (marksObtained / fullMarks) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 33) return 'D';
  return 'F';
}

const gradeBadgeClass = (grade: string) =>
  grade.startsWith('A')
    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
    : grade.startsWith('B') || grade === 'C'
      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
      : grade === 'F'
        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';

interface DraftRow {
  id: string | null;
  studentId: string;
  firstName: string;
  lastName: string | null;
  rollNo: number;
  marksObtained: number;
  remark: string;
}

function MarksGrid({
  sheet,
  examId,
  subjectId,
}: {
  sheet: ResultSheet;
  examId: string;
  subjectId: string;
}) {
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<DraftRow[]>(() =>
    sheet.marks.map((m) => ({
      id: m.id,
      studentId: m.studentId,
      firstName: m.firstName,
      lastName: m.lastName,
      rollNo: m.rollNo,
      marksObtained: m.marksObtained,
      remark: m.remark ?? '',
    })),
  );
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const saveMutation = useMutation({
    mutationFn: () =>
      sheet.isMarked
        ? teacherService.updateResult(
            examId,
            subjectId,
            rows.map((r) => ({
              id: r.id as string,
              studentId: r.studentId,
              marksObtained: r.marksObtained,
              remark: r.remark || undefined,
            })),
          )
        : teacherService.submitResult(
            examId,
            subjectId,
            rows.map((r) => ({
              studentId: r.studentId,
              marksObtained: r.marksObtained,
              remark: r.remark || undefined,
            })),
          ),
    onSuccess: () => {
      toast.success('Marksheet saved and submitted successfully!');
      queryClient.invalidateQueries({ queryKey: qk.teacher.result(examId, subjectId) });
      queryClient.invalidateQueries({ queryKey: qk.teacher.examDetail(examId) });
      queryClient.invalidateQueries({ queryKey: qk.teacher.dashboard() });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMarks = (studentId: string, marks: number) => {
    const clamped = Math.min(Math.max(0, marks), sheet.fullMarks);
    setRows((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, marksObtained: clamped } : r)),
    );
  };

  const updateRemark = (studentId: string, remark: string) => {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, remark } : r)));
  };

  const classAverage = rows.length
    ? (rows.reduce((sum, r) => sum + r.marksObtained, 0) / rows.length).toFixed(1)
    : '0';
  const highest = rows.length ? Math.max(...rows.map((r) => r.marksObtained)) : 0;
  const passCount = rows.filter((r) => (r.marksObtained / sheet.fullMarks) * 100 >= 33).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">
            {sheet.title} — {sheet.subjectName} ({sheet.subjectCode})
          </h2>
          <p className="text-muted-foreground text-xs">
            Class {sheet.className}-{sheet.section} · Full Marks {sheet.fullMarks}
          </p>
        </div>
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || rows.length === 0}
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiFloppyDisk className="h-3.5 w-3.5" />
          <span>{saveMutation.isPending ? 'Submitting...' : 'Save & Submit Marksheet'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-muted-foreground text-xs">Class Average:</span>
          <span className="text-primary text-sm font-bold">
            {classAverage} / {sheet.fullMarks}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-muted-foreground text-xs">Highest Score:</span>
          <span className="text-primary text-sm font-bold">
            {highest} / {sheet.fullMarks}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-muted-foreground text-xs">Passing Rate:</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {rows.length ? Math.round((passCount / rows.length) * 100) : 0}% ({passCount}/
            {rows.length})
          </span>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
              <TableHead className="w-16 text-xs font-bold">Roll #</TableHead>
              <TableHead className="text-xs font-bold">Student Name</TableHead>
              <TableHead className="w-32 text-xs font-bold">
                Marks (Max {sheet.fullMarks})
              </TableHead>
              <TableHead className="w-20 text-xs font-bold">Grade</TableHead>
              <TableHead className="text-xs font-bold">Faculty Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((student, idx) => {
              const grade = calculateGrade(sheet.fullMarks, student.marksObtained);
              return (
                <TableRow
                  key={student.studentId}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                >
                  <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                    #{student.rollNo}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {student.firstName} {student.lastName ?? ''}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Input
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="number"
                      min={0}
                      max={sheet.fullMarks}
                      value={student.marksObtained}
                      onChange={(e) => updateMarks(student.studentId, Number(e.target.value) || 0)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          inputRefs.current[idx + 1]?.focus();
                        }
                      }}
                      className="text-primary h-8 w-24 text-xs font-bold"
                    />
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold ${gradeBadgeClass(grade)}`}
                    >
                      {grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    <Input
                      value={student.remark}
                      onChange={(e) => updateRemark(student.studentId, e.target.value)}
                      placeholder="Add brief observation..."
                      className="h-8 text-xs"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export const TeacherResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [examId, setExamId] = useState(searchParams.get('examId') ?? '');
  const [subjectId, setSubjectId] = useState(searchParams.get('subjectId') ?? '');

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: qk.teacher.exams(),
    queryFn: () => teacherService.getExams(),
  });

  const { data: examDetail, isLoading: examDetailLoading } = useQuery({
    queryKey: qk.teacher.examDetail(examId),
    queryFn: () => teacherService.getExamDetail(examId),
    enabled: !!examId,
  });

  const {
    data: resultSheet,
    isLoading: sheetLoading,
    isError: sheetErrored,
    error: sheetError,
    refetch: refetchSheet,
  } = useQuery({
    queryKey: qk.teacher.result(examId, subjectId),
    queryFn: () => teacherService.getResult(examId, subjectId),
    enabled: !!examId && !!subjectId,
  });

  const selectedSubject = useMemo(
    () => examDetail?.subjects.find((s) => s.subjectId === subjectId),
    [examDetail, subjectId],
  );

  const handleExamChange = (id: string) => {
    setExamId(id);
    setSubjectId('');
    setSearchParams(id ? { examId: id } : {});
  };

  const handleSubjectChange = (id: string) => {
    setSubjectId(id);
    setSearchParams(examId ? { examId, subjectId: id } : {});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Exam Grading & Marksheet Entry
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              Live Grade Calculation
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Input subject-wise student marks and submit for result publication.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Examination
            </span>
            <select
              value={examId}
              onChange={(e) => handleExamChange(e.target.value)}
              disabled={examsLoading}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">{examsLoading ? 'Loading…' : 'Select an examination'}</option>
              {(exams ?? []).map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} — Class {ex.className}-{ex.section}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Subject
            </span>
            <select
              value={subjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              disabled={!examId || examDetailLoading}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">
                {!examId
                  ? 'Pick an exam first'
                  : examDetailLoading
                    ? 'Loading…'
                    : 'Select a subject'}
              </option>
              {(examDetail?.subjects ?? []).map((s) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.subjectName} ({s.subjectCode}) {s.isMarked ? '· Marked' : '· Pending'}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grading Grid */}
      {!examId || !subjectId ? (
        <Empty className="rounded-md border">
          <EmptyMedia variant="icon">
            <PiFileDashed className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Pick an exam and subject</EmptyTitle>
          <EmptyDescription>
            Select an examination and one of your subjects to begin grading.
          </EmptyDescription>
        </Empty>
      ) : sheetLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : sheetErrored || !resultSheet ? (
        <ErrorState description={getErrorMessage(sheetError)} onRetry={() => refetchSheet()} />
      ) : (
        <MarksGrid
          key={`${examId}-${subjectId}`}
          sheet={resultSheet}
          examId={examId}
          subjectId={subjectId}
        />
      )}

      {selectedSubject?.isMarked && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <PiMedal className="text-primary h-3.5 w-3.5" />
          This subject already has marks entered — saving will update the existing marksheet.
        </p>
      )}
    </div>
  );
};

export default TeacherResults;
