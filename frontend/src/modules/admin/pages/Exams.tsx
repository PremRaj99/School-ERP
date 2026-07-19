import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExamItem {
  id: string;
  title: string;
  dateFrom: string;
  dateTo: string;
  isResultDecleared: boolean;
  class?: { className: string; section: string };
}
interface ApiError {
  response?: { data?: { message?: string } };
}

const examFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  dateFrom: z.string().min(1, 'Start date is required'),
  dateTo: z.string().min(1, 'End date is required'),
  exams: z.array(
    z.object({
      className: z.string().min(1, 'Class is required'),
      section: z.string().min(1, 'Section is required'),
      subjects: z.array(
        z.object({
          subjectCode: z.string().min(1, 'Subject code is required'),
          fullMarks: z.number().min(1, 'Full marks must be > 0'),
          date: z.string().min(1, 'Subject exam date is required'),
        }),
      ),
    }),
  ),
});

type ExamFormValues = z.infer<typeof examFormSchema>;

export default function Exams() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: exams, isLoading } = useQuery({
    queryKey: ['admin', 'exams'],
    queryFn: adminService.getExams,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      toast.success('Exam structure created successfully!');
      setOpen(false);
      reset();
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to create exam.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      toast.success('Exam structure deleted successfully!');
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to delete exam.');
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      exams: [
        {
          className: '',
          section: '',
          subjects: [{ subjectCode: '', fullMarks: 100, date: '' }],
        },
      ],
    },
  });

  const { fields: examFields } = useFieldArray({
    control,
    name: 'exams',
  });

  const onSubmit = (data: ExamFormValues) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (
      confirm('Are you sure you want to delete this exam? This will delete all linked subjects.')
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exams Coordinator</h2>
          <p className="text-muted-foreground">
            Manage school examinations, subject schedules, and grading targets.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Schedule Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Schedule New Exam</DialogTitle>
              <DialogDescription>
                Configure exam date span and target classes/subjects.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input id="title" placeholder="Mid Term Examination 2026" {...register('title')} />
                {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Date From</Label>
                  <Input id="dateFrom" type="date" {...register('dateFrom')} />
                  {errors.dateFrom && (
                    <p className="text-destructive text-xs">{errors.dateFrom.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Date To</Label>
                  <Input id="dateTo" type="date" {...register('dateTo')} />
                  {errors.dateTo && (
                    <p className="text-destructive text-xs">{errors.dateTo.message}</p>
                  )}
                </div>
              </div>

              {/* Class configuration array */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Exams Configuration</Label>
                </div>

                {examFields.map((field, examIdx) => (
                  <div
                    key={field.id}
                    className="bg-muted/10 relative space-y-4 rounded-md border p-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Class Name</Label>
                        <Input
                          placeholder="Class 10"
                          {...register(`exams.${examIdx}.className` as const)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Section</Label>
                        <Input placeholder="A" {...register(`exams.${examIdx}.section` as const)} />
                      </div>
                    </div>

                    <div className="space-y-2 border-t pt-4">
                      <Label className="text-xs font-semibold">Subject Schedules</Label>
                      {/* Simple direct input for subject configurations */}
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Subject Code</Label>
                          <Input
                            placeholder="MATH101"
                            {...register(`exams.${examIdx}.subjects.0.subjectCode` as const)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Full Marks</Label>
                          <Input
                            type="number"
                            placeholder="100"
                            {...register(`exams.${examIdx}.subjects.0.fullMarks` as const, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Exam Date</Label>
                          <Input
                            type="date"
                            {...register(`exams.${examIdx}.subjects.0.date` as const)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Scheduling...' : 'Schedule Exam'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Upcoming & Past Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !exams || exams.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">No exams scheduled yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Title</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam: ExamItem) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-semibold whitespace-nowrap">
                        {exam.title}
                      </TableCell>
                      <TableCell>
                        {exam.class?.className || 'All'} - {exam.class?.section || 'All'}
                      </TableCell>
                      <TableCell>{exam.dateFrom}</TableCell>
                      <TableCell>{exam.dateTo}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            exam.isResultDecleared
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {exam.isResultDecleared ? 'Results Declared' : 'Result Pending'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(exam.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
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
