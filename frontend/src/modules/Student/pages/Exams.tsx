import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Award, Calendar, Printer, School } from 'lucide-react';
import { toast } from 'sonner';

const pastExamResults = [
  {
    subject: 'Mathematics (MATH101)',
    maxMarks: 100,
    marksObtained: 94,
    grade: 'A+',
    remark: 'Outstanding',
  },
  {
    subject: 'Physics (PHY201)',
    maxMarks: 100,
    marksObtained: 88,
    grade: 'A',
    remark: 'Excellent',
  },
  {
    subject: 'Chemistry (CHEM301)',
    maxMarks: 100,
    marksObtained: 90,
    grade: 'A+',
    remark: 'Distinction',
  },
  {
    subject: 'English Literature (ENG001)',
    maxMarks: 100,
    marksObtained: 85,
    grade: 'A',
    remark: 'Very Good',
  },
  {
    subject: 'Computer Science (CS501)',
    maxMarks: 100,
    marksObtained: 96,
    grade: 'A+',
    remark: 'Top in Section',
  },
];

const upcomingExamsList = [
  {
    title: 'Pre-Board Series 1 • Mathematics',
    date: '10-12-2025',
    time: '09:00 - 12:00 PM',
    hall: 'Hall 1',
  },
  {
    title: 'Pre-Board Series 1 • Physics',
    date: '12-12-2025',
    time: '09:00 - 12:00 PM',
    hall: 'Hall 1',
  },
  {
    title: 'Pre-Board Series 1 • Chemistry',
    date: '15-12-2025',
    time: '09:00 - 12:00 PM',
    hall: 'Hall 1',
  },
];

export const StudentExams: React.FC = () => {
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  const totalMarks = pastExamResults.reduce((acc, c) => acc + c.marksObtained, 0);
  const maxTotal = pastExamResults.reduce((acc, c) => acc + c.maxMarks, 0);
  const percentage = ((totalMarks / maxTotal) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Examinations & Formal Marksheets
            </h1>
            <Badge variant="outline" className="border-amber-500/30 text-xs text-amber-600">
              Grade A+ (90.6%)
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Review upcoming assessment schedules and view official downloadable term report cards.
          </p>
        </div>

        <Button
          onClick={() => setIsReportCardOpen(true)}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Award className="h-3.5 w-3.5" />
          <span>View Official Report Card</span>
        </Button>
      </div>

      {/* Summary Performance Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Aggregate Score</span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {totalMarks} / {maxTotal}
            </p>
            <span className="text-[11px] font-semibold text-indigo-600">
              {percentage}% Total Average
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Cumulative Grade</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              Grade A+
            </p>
            <span className="text-[11px] font-semibold text-emerald-600">
              Passed with Distinction
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Class Standing</span>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">Rank #2</p>
            <span className="text-muted-foreground text-[11px]">Class 10-A (42 Students)</span>
          </CardContent>
        </Card>
      </div>

      {/* Mid-Term Results Marksheet Table */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
          <div>
            <CardTitle className="text-base font-bold">
              Mid-Term Assessment 2025-2026 Marksheet
            </CardTitle>
            <CardDescription className="text-xs">
              Subject-wise marks distribution verified by Academic Examination Board.
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            Results Declared
          </Badge>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
              <TableHead className="text-xs font-bold">Subject Curriculum</TableHead>
              <TableHead className="text-xs font-bold">Max Marks</TableHead>
              <TableHead className="text-xs font-bold">Marks Scored</TableHead>
              <TableHead className="text-xs font-bold">Letter Grade</TableHead>
              <TableHead className="text-right text-xs font-bold">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pastExamResults.map((row, idx) => (
              <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                  {row.subject}
                </TableCell>
                <TableCell className="text-xs">{row.maxMarks}</TableCell>
                <TableCell className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {row.marksObtained}
                </TableCell>
                <TableCell className="text-xs">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  >
                    {row.grade}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-xs">
                  {row.remark}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Upcoming Exam Schedules */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="border-b border-slate-100 pb-3 dark:border-zinc-800">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span>Upcoming Examination Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5 p-4">
          {upcomingExamsList.map((exam, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{exam.title}</span>
                <p className="text-muted-foreground text-[11px]">{exam.hall}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {exam.date}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {exam.time}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Official Report Card Printable Modal */}
      <Dialog open={isReportCardOpen} onOpenChange={setIsReportCardOpen}>
        <DialogContent className="sm:max-w-xl">
          <div className="space-y-4 pt-2">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs shadow-sm dark:border-zinc-700 dark:bg-zinc-800/60">
              <div className="space-y-1 border-b pb-4 text-center">
                <div className="inline-flex items-center justify-center gap-1.5 text-base font-bold text-slate-900 dark:text-white">
                  <School className="h-5 w-5 text-indigo-600" />
                  <span>AURA INTERNATIONAL ACADEMY</span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Official Academic Report Card • Academic Session 2025-2026
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground text-[10px]">Student Name:</span>
                  <p className="font-bold">Aryan Sharma</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Student ID / Roll:</span>
                  <p className="font-mono font-bold">STU-2025-001 (Roll #101)</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Class & Section:</span>
                  <p className="font-semibold">Class 10 - Section A</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Assessment:</span>
                  <p className="font-semibold">Mid-Term Examination</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[11px] font-bold dark:bg-zinc-700/50">
                    <tr>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Max</th>
                      <th className="p-2">Scored</th>
                      <th className="p-2">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-700">
                    {pastExamResults.map((r, i) => (
                      <tr key={i}>
                        <td className="p-2 font-medium">{r.subject}</td>
                        <td className="p-2">{r.maxMarks}</td>
                        <td className="p-2 font-bold">{r.marksObtained}</td>
                        <td className="p-2 font-bold text-emerald-600">{r.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/30">
                <div>
                  <span className="text-muted-foreground text-[10px]">Final Aggregate:</span>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {totalMarks} / {maxTotal} ({percentage}%)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-[10px]">Result Status:</span>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    PASSED (GRADE A+)
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-indigo-600 text-xs text-white hover:bg-indigo-700"
              onClick={() => toast.success('Sending official report card to printer...')}
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              <span>Print Official Report Card</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentExams;
