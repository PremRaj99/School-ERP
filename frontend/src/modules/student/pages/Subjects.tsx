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
import { Loader2, BookOpen } from 'lucide-react';

interface SubjectItem {
  id: string;
  subjectName: string;
  subjectCode: string;
}

export default function Subjects() {
  const { data: subjects, isLoading } = useQuery({
    queryKey: ['student', 'subjects'],
    queryFn: studentService.getSubjects,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Subjects</h2>
        <p className="text-muted-foreground">
          List of academic courses enrolled in the current class group.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle>Enrolled Subjects</CardTitle>
            <CardDescription>Courses, codes, and details.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !subjects || subjects.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">No subjects enrolled.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead className="text-right">Subject Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((sub: SubjectItem) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-semibold">{sub.subjectName}</TableCell>
                      <TableCell className="text-right">{sub.subjectCode}</TableCell>
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
