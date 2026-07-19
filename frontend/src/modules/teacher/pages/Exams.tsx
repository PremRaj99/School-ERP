import { useQuery } from '@tanstack/react-query';
import { teacherService } from '../services/teacherService';
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
import { Loader2, ShieldAlert } from 'lucide-react';

interface ExamItem {
  id: string;
  title: string;
  class?: { className: string; section: string };
  dateFrom: string;
  dateTo: string;
  isResultDecleared: boolean;
}

export default function Exams() {
  const { data: exams, isLoading } = useQuery({
    queryKey: ['teacher', 'exams'],
    queryFn: teacherService.getExams,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Exams Registry</h2>
        <p className="text-muted-foreground">List of scheduled school exams and grading status.</p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-violet-600" />
          <div>
            <CardTitle>School Examinations</CardTitle>
            <CardDescription>View upcoming dates and schedules.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !exams || exams.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">No exams registered.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Results Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((ex: ExamItem) => (
                    <TableRow key={ex.id}>
                      <TableCell className="font-semibold">{ex.title}</TableCell>
                      <TableCell>
                        {ex.class?.className} - {ex.class?.section}
                      </TableCell>
                      <TableCell>{ex.dateFrom?.split('T')[0]}</TableCell>
                      <TableCell>{ex.dateTo?.split('T')[0]}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            ex.isResultDecleared
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {ex.isResultDecleared ? 'Declared' : 'Pending'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
