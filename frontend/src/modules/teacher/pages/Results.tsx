import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { teacherService } from '@/lib/services/teacher.service';
import type { ExamResult } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const TeacherResults: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({
    examId: '',
    subjectId: '',
  });

  const [marksRow, setMarksRow] = useState({
    studentId: '',
    marksObtained: '',
    remark: '',
  });

  const [existingResults, setExistingResults] = useState<ExamResult[] | null>(null);

  const handleLoadRoster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.examId || !params.subjectId) {
      toast.error('Enter both Exam ID and Subject ID');
      return;
    }
    setLoading(true);
    try {
      const res = await teacherService.getResult(params.examId, params.subjectId);
      setExistingResults(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Student roster & existing marks loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!params.examId || !params.subjectId) {
      toast.error('Specify Exam ID and Subject ID first');
      return;
    }
    setLoading(true);
    try {
      const payload = [
        {
          studentId: marksRow.studentId,
          marksObtained: Number(marksRow.marksObtained),
          remark: marksRow.remark || undefined,
        },
      ];
      const res = await teacherService.submitResult(params.examId, params.subjectId, payload);
      toast.success(res.message || 'Marks submitted and graded successfully!');
      setMarksRow({ studentId: '', marksObtained: '', remark: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMarks = async () => {
    if (!params.examId || !params.subjectId) {
      toast.error('Specify Exam ID and Subject ID first');
      return;
    }
    setLoading(true);
    try {
      const payload = [
        {
          studentId: marksRow.studentId,
          marksObtained: Number(marksRow.marksObtained),
          remark: marksRow.remark || undefined,
        },
      ];
      const res = await teacherService.updateResult(params.examId, params.subjectId, payload);
      toast.success(res.message || 'Marks updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grade Entry & Results</h1>
        <p className="text-muted-foreground text-xs">
          Enter and submit subject marks for student rosters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Exam & Subject</CardTitle>
            <CardDescription>Specify the examination and subject to grade.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLoadRoster}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examId">Exam ID</Label>
                <Input
                  id="examId"
                  placeholder="24-character Exam ObjectId"
                  value={params.examId}
                  onChange={(e) => setParams({ ...params, examId: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectId">Subject ID</Label>
                <Input
                  id="subjectId"
                  placeholder="24-character Subject/ExamSubject ObjectId"
                  value={params.subjectId}
                  onChange={(e) => setParams({ ...params, subjectId: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              {existingResults && (
                <div className="max-h-36 space-y-1 overflow-y-auto pt-2">
                  <p className="text-xs font-semibold">
                    Loaded Roster ({existingResults.length} records):
                  </p>
                  {existingResults.map((r, i) => (
                    <div key={i} className="flex justify-between rounded border p-1 text-xs">
                      <span>{r.studentId}</span>
                      <span>
                        Marks: {r.marksObtained ?? 'Unmarked'} (Grade: {r.grade || '—'})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : 'Load Student Roster'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit Student Marks</CardTitle>
            <CardDescription>Enter marks obtained and optional qualitative remark.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitMarks}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="e.g. STU12345678"
                  value={marksRow.studentId}
                  onChange={(e) => setMarksRow({ ...marksRow, studentId: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marksObtained">Marks Obtained</Label>
                <Input
                  id="marksObtained"
                  type="number"
                  placeholder="e.g. 85"
                  value={marksRow.marksObtained}
                  onChange={(e) => setMarksRow({ ...marksRow, marksObtained: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remark">Remark (opt)</Label>
                <Input
                  id="remark"
                  placeholder="e.g. Excellent performance"
                  value={marksRow.remark}
                  onChange={(e) => setMarksRow({ ...marksRow, remark: e.target.value })}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Marks'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleUpdateMarks}
                disabled={loading}
                className="w-full"
              >
                Update Marks
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TeacherResults;
