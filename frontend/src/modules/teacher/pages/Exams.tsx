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
import type { Exam, ExamClassGroup, ExamSubjectInfo } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const TeacherExams: React.FC = () => {
  const [examId, setExamId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [examDetail, setExamDetail] = useState<Exam | null>(null);

  const handleFetchExams = async () => {
    setLoading(true);
    try {
      const res = await teacherService.getExams();
      setExams(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Exams refreshed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchExamDetail = async () => {
    if (!examId) {
      toast.error('Enter Exam ID to inspect');
      return;
    }
    setLoading(true);
    try {
      const res = await teacherService.getExamDetail(examId);
      setExamDetail(res.data);
      toast.success('Exam details loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filtered = exams?.filter((e) => {
    const q = search.toLowerCase();
    return e.title?.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assigned Examinations</h1>
        <p className="text-muted-foreground text-xs">
          View assigned exam schedules and grading deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assigned Exams</CardTitle>
            <CardDescription>Search and filter exam datesheets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Exams</Label>
              <Input
                id="search"
                placeholder="e.g. Mid-Term, Class 10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleFetchExams} disabled={loading} className="w-full">
              {loading ? 'Refreshing...' : 'Load Assigned Exams'}
            </Button>
            {exams && (
              <div className="max-h-48 space-y-2 overflow-y-auto pt-2">
                {filtered && filtered.length > 0 ? (
                  filtered.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded border p-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold">{e.title}</p>
                        <p className="text-muted-foreground">
                          {e.dateFrom} - {e.dateTo}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setExamId(e.id || e._id || '')}
                      >
                        Select
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">No assigned exams found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Detail & Subject Schedule</CardTitle>
            <CardDescription>Check subject marking status for a specific Exam ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="examId">Exam ID</Label>
              <Input
                id="examId"
                placeholder="24-character Exam ObjectId"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                disabled={loading}
              />
            </div>
            {examDetail && (
              <div className="bg-muted/40 space-y-2 rounded border p-3 text-xs">
                <h4 className="font-bold">{examDetail.title}</h4>
                <p>
                  Status:{' '}
                  {examDetail.isResultDecleared ? 'Results Declared' : 'Grading in Progress'}
                </p>
                {examDetail.exams && (
                  <div className="space-y-1 border-t pt-1">
                    <p className="font-semibold">Classes & Subjects:</p>
                    {examDetail.exams.map((ex: ExamClassGroup, idx: number) => (
                      <div key={idx} className="rounded border p-1">
                        <p className="font-medium">
                          Class {ex.className}-{ex.section}
                        </p>
                        {ex.subjects?.map((sub: ExamSubjectInfo, sIdx: number) => (
                          <p key={sIdx} className="text-muted-foreground flex justify-between">
                            <span>
                              {sub.subjectCode} ({sub.date})
                            </span>
                            <span>{sub.isMarked ? 'Graded' : 'Pending'}</span>
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              onClick={handleFetchExamDetail}
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? 'Fetching...' : 'View Exam Subjects'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TeacherExams;
