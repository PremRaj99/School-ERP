import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Loader2, Award, Clipboard } from 'lucide-react';

interface ExamItem {
  id: string;
  title: string;
  dateFrom: string;
  isResultDecleared: boolean;
}

export default function Exams() {
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState(false);

  // Fetch list of exams
  const { data: exams, isLoading: loadingExams } = useQuery({
    queryKey: ['student', 'exams'],
    queryFn: studentService.getExams,
  });

  // Fetch results for selected exam
  const {
    data: results,
    isLoading: loadingResults,
    refetch,
  } = useQuery({
    queryKey: ['student', 'results', selectedExamId],
    queryFn: () => studentService.getResults(selectedExamId!),
    enabled: activeQuery && !!selectedExamId,
  });

  const handleFetchResults = (examId: string) => {
    setSelectedExamId(examId);
    setActiveQuery(true);
    // Refetch in case it is already cached but we changed the ID
    setTimeout(() => refetch(), 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Exams & Results</h2>
        <p className="text-muted-foreground">
          Check schedules for exams, and view grade details when results are declared.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Exams List */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="h-5 w-5 text-blue-600" />
              Schedules
            </CardTitle>
            <CardDescription>
              All academic examinations scheduled for your class group.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingExams ? (
              <div className="flex justify-center p-8">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : !exams || exams.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                No exams scheduled for your class.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead className="text-right">Results</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exams.map((ex: ExamItem) => (
                      <TableRow key={ex.id}>
                        <TableCell className="font-semibold">{ex.title}</TableCell>
                        <TableCell>{ex.dateFrom?.split('T')[0]}</TableCell>
                        <TableCell className="text-right">
                          {ex.isResultDecleared ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-200 text-green-600 hover:bg-green-50"
                              onClick={() => handleFetchResults(ex.id)}
                            >
                              View Grades
                            </Button>
                          ) : (
                            <span className="text-muted-foreground text-xs">Pending</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results view */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-600" />
              Grading Report
            </CardTitle>
            <CardDescription>Select an exam on the left to show your marks sheet.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingResults ? (
              <div className="flex justify-center p-8">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
              </div>
            ) : !results ? (
              <div className="text-muted-foreground py-12 text-center">
                No grading sheet loaded. Click "View Grades" on declared exams to fetch records.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h4 className="text-lg font-bold">{results.title}</h4>
                  <p className="text-muted-foreground text-sm">
                    Class: {results.className}-{results.section} | Roll No: {results.rollNo}
                  </p>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Marks</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.marks?.map(
                        (
                          m: {
                            subjectName: string;
                            marksObtained: number;
                            fullMarks: number;
                            grade: string;
                            remark?: string;
                          },
                          idx: number,
                        ) => (
                          <TableRow key={idx}>
                            <TableCell className="font-semibold">{m.subjectName}</TableCell>
                            <TableCell>
                              {m.marksObtained} / {m.fullMarks}
                            </TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                {m.grade}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {m.remark || '-'}
                            </TableCell>
                          </TableRow>
                        ),
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
