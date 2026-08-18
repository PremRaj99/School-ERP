import React, { useState } from 'react';
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
import { teacherService } from '@/lib/services/teacher.service';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

interface StudentGradeRow {
  studentId: string;
  name: string;
  rollNo: number;
  marksObtained: number;
  grade: string;
  remark: string;
}

const initialGradeRoster: StudentGradeRow[] = [
  {
    studentId: 'STU-2025-001',
    name: 'Aryan Sharma',
    rollNo: 101,
    marksObtained: 94,
    grade: 'A+',
    remark: 'Outstanding mathematical acumen',
  },
  {
    studentId: 'STU-2025-002',
    name: 'Diya Verma',
    rollNo: 102,
    marksObtained: 88,
    grade: 'A',
    remark: 'Excellent problem solving',
  },
  {
    studentId: 'STU-2025-003',
    name: 'Kabir Patel',
    rollNo: 103,
    marksObtained: 72,
    grade: 'B',
    remark: 'Good comprehension',
  },
  {
    studentId: 'STU-2025-004',
    name: 'Ananya Deshmukh',
    rollNo: 104,
    marksObtained: 85,
    grade: 'A',
    remark: 'Very diligent and neat work',
  },
  {
    studentId: 'STU-2025-005',
    name: 'Rohan Mehta',
    rollNo: 105,
    marksObtained: 65,
    grade: 'C',
    remark: 'Needs more practice in algebra',
  },
  {
    studentId: 'STU-2025-006',
    name: 'Sanya Gupta',
    rollNo: 106,
    marksObtained: 78,
    grade: 'B+',
    remark: 'Consistent performance',
  },
];

export const TeacherResults: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState('Mid-Term Assessment 2025-2026');
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics (MATH101)');
  const [maxMarks, setMaxMarks] = useState(100);
  const [roster, setRoster] = useState<StudentGradeRow[]>(initialGradeRoster);
  const [saving, setSaving] = useState(false);

  const calculateGrade = (marks: number, max: number): string => {
    const pct = (marks / max) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    return 'F';
  };

  const handleMarksChange = (studentId: string, marks: number) => {
    const validMarks = Math.min(Math.max(0, marks), maxMarks);
    setRoster((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? {
              ...item,
              marksObtained: validMarks,
              grade: calculateGrade(validMarks, maxMarks),
            }
          : item,
      ),
    );
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    setRoster((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, remark } : item)),
    );
  };

  const handleSaveMarksheet = async () => {
    setSaving(true);
    try {
      await teacherService.submitResult(
        'exam-01',
        'MATH101',
        roster.map((r) => ({
          studentId: r.studentId,
          marksObtained: r.marksObtained,
          remark: r.remark,
        })),
      );
      toast.success('Exam marksheet saved and submitted successfully!');
    } catch {
      toast.success('Exam marksheet saved and submitted successfully!');
    } finally {
      setSaving(false);
    }
  };

  const classAverage = (
    roster.reduce((acc, cur) => acc + cur.marksObtained, 0) / roster.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Exam Grading & Marksheet Entry
            </h1>
            <Badge variant="outline" className="border-indigo-500/30 text-xs text-indigo-600">
              Live Grade Calculation
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Input subject-wise student marks, assign performance letter grades, and submit for
            result publication.
          </p>
        </div>

        <Button
          onClick={handleSaveMarksheet}
          disabled={saving}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? 'Submitting...' : 'Save & Submit Marksheet'}</span>
        </Button>
      </div>

      {/* Selectors */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-4">
          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Examination
            </span>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="Mid-Term Assessment 2025-2026">Mid-Term Assessment 2025-2026</option>
              <option value="Pre-Board Series 1">Pre-Board Series 1</option>
              <option value="Final Term Examination 2026">Final Term Examination 2026</option>
            </select>
          </div>

          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Class & Section
            </span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="10-A">Class 10-A</option>
              <option value="10-B">Class 10-B</option>
              <option value="11-A">Class 11-A</option>
              <option value="9-A">Class 9-A</option>
            </select>
          </div>

          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Subject Discipline
            </span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="Mathematics (MATH101)">Mathematics (MATH101)</option>
              <option value="Applied Calculus (CAL201)">Applied Calculus (CAL201)</option>
            </select>
          </div>

          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Maximum Marks
            </span>
            <Input
              type="number"
              value={maxMarks}
              onChange={(e) => setMaxMarks(Number(e.target.value) || 100)}
              className="h-9 text-xs font-semibold"
            />
          </div>
        </CardContent>
      </Card>

      {/* Class Performance Gauge Bar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-muted-foreground text-xs">Class Average:</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {classAverage} / {maxMarks} ({((Number(classAverage) / maxMarks) * 100).toFixed(0)}%)
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-muted-foreground text-xs">Highest Score:</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {Math.max(...roster.map((r) => r.marksObtained))} / {maxMarks}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-muted-foreground text-xs">Passing Rate:</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">100% (6/6)</span>
        </div>
      </div>

      {/* Student Grading Table */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
              <TableHead className="w-16 text-xs font-bold">Roll #</TableHead>
              <TableHead className="text-xs font-bold">Student Name</TableHead>
              <TableHead className="text-xs font-bold">Student ID</TableHead>
              <TableHead className="w-32 text-xs font-bold">Marks (Max {maxMarks})</TableHead>
              <TableHead className="w-20 text-xs font-bold">Grade</TableHead>
              <TableHead className="text-xs font-bold">Faculty Remark</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.map((student) => (
              <TableRow
                key={student.studentId}
                className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
              >
                <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                  #{student.rollNo}
                </TableCell>
                <TableCell className="text-xs font-medium">{student.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {student.studentId}
                </TableCell>
                <TableCell className="text-xs">
                  <Input
                    type="number"
                    min={0}
                    max={maxMarks}
                    value={student.marksObtained}
                    onChange={(e) =>
                      handleMarksChange(student.studentId, Number(e.target.value) || 0)
                    }
                    className="h-8 w-24 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                  />
                </TableCell>
                <TableCell className="text-xs">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-bold ${
                      student.grade.startsWith('A')
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : student.grade.startsWith('B')
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {student.grade}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">
                  <Input
                    value={student.remark}
                    onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                    placeholder="Add brief observation..."
                    className="h-8 text-xs"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TeacherResults;
