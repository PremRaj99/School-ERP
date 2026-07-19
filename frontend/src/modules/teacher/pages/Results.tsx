import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { teacherService } from '../services/teacherService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
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
import { Loader2, Award } from 'lucide-react';
import { toast } from 'sonner';

interface ExamItem { id: string; title: string; class?: { className: string; section: string }; }
interface ApiError { response?: { data?: { message?: string } } }


const marksFormSchema = z.object({
  marks: z.array(
    z.object({
      studentId: z.string(),
      firstName: z.string(),
      lastName: z.string().nullable().optional(),
      rollNo: z.number(),
      marksObtained: z.number().min(0, 'Marks must be >= 0'),
      remark: z.string().optional(),
    }),
  ),
});

type MarksFormValues = z.infer<typeof marksFormSchema>;

export default function Results() {
  const queryClient = useQueryClient();
  const [examId, setExamId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [activeQuery, setActiveQuery] = useState(false);

  // Get list of exams
  const { data: exams } = useQuery({
    queryKey: ['teacher', 'exams'],
    queryFn: teacherService.getExams,
  });

  // Get results details
  const {
    data: resultDetails,
    isLoading: loadingDetails,
    refetch,
  } = useQuery({
    queryKey: ['teacher', 'result-details', examId, subjectId],
    queryFn: () => teacherService.getResults(examId, subjectId),
    enabled: activeQuery && !!examId && !!subjectId,
  });

  // Form
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<MarksFormValues>({
    resolver: zodResolver(marksFormSchema),
    defaultValues: { marks: [] },
  });

  const { fields } = useFieldArray({
    control,
    name: 'marks',
  });

  // Load results details into form
  useEffect(() => {
    if (resultDetails && resultDetails.marks) {
      setValue(
        'marks',
        resultDetails.marks.map((m: { studentId: string; firstName: string; lastName?: string | null; rollNo: number; marksObtained: number; remark?: string; }) => ({
          studentId: m.studentId,
          firstName: m.firstName,
          lastName: m.lastName,
          rollNo: m.rollNo,
          marksObtained: m.marksObtained,
          remark: m.remark || '',
        })),
      );
    }
  }, [resultDetails, setValue]);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (data: Array<{ studentId: string; marksObtained: number; remark: string }>) => {
      const isMarked = resultDetails?.isMarked;
      if (isMarked) {
        return teacherService.updateResults(examId, subjectId, data);
      } else {
        return teacherService.createResults(examId, subjectId, data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'result-details', examId, subjectId] });
      toast.success('Student grades saved successfully!');
      refetch();
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to save student grades.');
    },
  });

  const onSubmit = (data: MarksFormValues) => {
    const payload = data.marks.map((m) => ({
      studentId: m.studentId,
      marksObtained: m.marksObtained,
      remark: m.remark || 'N/A',
    }));
    saveMutation.mutate(payload);
  };

  const handleFetch = () => {
    if (!examId || !subjectId) {
      toast.error('Please enter both Exam ID and Subject ID.');
      return;
    }
    setActiveQuery(true);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Student Grading</h2>
        <p className="text-muted-foreground">
          Input and update examination marks for student classes.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Grading Coordinates</CardTitle>
          <CardDescription>Select targeted examination and subject code details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Select Examination</Label>
              <select
                className="border-input focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                value={examId}
                onChange={(e) => {
                  setExamId(e.target.value);
                  setActiveQuery(false);
                }}
              >
                <option value="">-- Choose Exam --</option>
                {exams?.map((ex: ExamItem) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title} ({ex.class?.className}-{ex.class?.section})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject Object ID</Label>
              <Input
                id="subjectId"
                placeholder="Enter Subject ID"
                value={subjectId}
                onChange={(e) => {
                  setSubjectId(e.target.value);
                  setActiveQuery(false);
                }}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleFetch} className="w-full bg-violet-600 hover:bg-violet-700">
                Fetch Grading Sheet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeQuery && (
        <Card className="border-border shadow-sm">
          {loadingDetails ? (
            <div className="flex justify-center p-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !resultDetails ? (
            <div className="text-muted-foreground py-12 text-center">
              No exam subject found for the selected IDs.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-violet-600" />
                    {resultDetails.title} - {resultDetails.subjectName} ({resultDetails.subjectCode}
                    )
                  </CardTitle>
                  <CardDescription>
                    Class: {resultDetails.className}-{resultDetails.section} | Full Marks:{' '}
                    {resultDetails.fullMarks}
                  </CardDescription>
                </div>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-violet-600 hover:bg-violet-700"
                >
                  {saveMutation.isPending ? 'Saving...' : 'Submit Grades'}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">Roll No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="w-[180px]">Marks Obtained</TableHead>
                        <TableHead>Remark / Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, idx) => (
                        <TableRow key={field.id}>
                          <TableCell className="font-semibold">{field.rollNo}</TableCell>
                          <TableCell>
                            {field.firstName} {field.lastName || ''}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              className="border-input w-32"
                              placeholder="0"
                              {...register(`marks.${idx}.marksObtained` as const, {
                                valueAsNumber: true,
                              })}
                            />
                            {errors.marks?.[idx]?.marksObtained && (
                              <p className="text-destructive mt-1 text-xs">
                                {errors.marks[idx]?.marksObtained?.message}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              className="border-input"
                              placeholder="Excellent effort"
                              {...register(`marks.${idx}.remark` as const)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
