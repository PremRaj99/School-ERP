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
import { studentService } from '@/lib/services/student.service';
import type { Exam, ExamResult } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const StudentExams: React.FC = () => {
  const [examId, setExamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<ExamResult | null>(null);
  const [examsList, setExamsList] = useState<Exam[] | null>(null);

  const handleFetchResults = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId) {
      toast.error('Please enter an Exam ID');
      return;
    }
    setLoading(true);
    try {
      const res = await studentService.getResult(examId);
      setResultData(res.data);
      toast.success(res.message || 'Exam results retrieved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchExams = async () => {
    setLoading(true);
    try {
      const res = await studentService.getExams();
      setExamsList(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Exams list refreshed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exams & Results</h1>
        <p className="text-muted-foreground text-xs">
          Check datesheets, examination schedules, and published report cards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>View Declared Exam Results</CardTitle>
            <CardDescription>
              Enter an Exam ID to view your marks breakdown and grade.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleFetchResults}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examId">Exam ID</Label>
                <Input
                  id="examId"
                  placeholder="24-character Exam ObjectId"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {resultData && (
                <div className="bg-muted/40 space-y-1 rounded border p-3 text-xs">
                  <p>
                    <strong>Marks:</strong> {resultData.marksObtained ?? 'N/A'}
                  </p>
                  <p>
                    <strong>Grade:</strong> {resultData.grade ?? 'N/A'}
                  </p>
                  <p>
                    <strong>Remark:</strong> {resultData.remark ?? 'None'}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Fetching...' : 'View Results'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Examinations</CardTitle>
            <CardDescription>Scheduled exams for your class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleFetchExams}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Refreshing...' : 'Load Scheduled Exams'}
            </Button>
            {examsList && (
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {examsList.length > 0 ? (
                  examsList.map((exam, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded border p-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold">{exam.title}</p>
                        <p className="text-muted-foreground">
                          {exam.dateFrom} to {exam.dateTo}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setExamId(exam.id || exam._id || '')}
                      >
                        Select ID
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">No scheduled exams found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentExams;
