import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
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

interface SubjectItem {
  id: string;
  subjectName: string;
  subjectCode: string;
}
interface ApiError {
  response?: { data?: { message?: string } };
}

const subjectSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required'),
  subjectCode: z.string().min(1, 'Subject code is required'),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

export default function Subjects() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: adminService.getSubjects,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] });
      toast.success('Subject created successfully!');
      setOpen(false);
      reset();
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to create subject.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'subjects'] });
      toast.success('Subject deleted successfully!');
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to delete subject.');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
  });

  const onSubmit = (data: SubjectFormValues) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subjects Manager</h2>
          <p className="text-muted-foreground">Manage and assign school courses and subjects.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Enter details to add a new subject to curriculum.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input id="subjectName" placeholder="Mathematics" {...register('subjectName')} />
                {errors.subjectName && (
                  <p className="text-destructive text-xs">{errors.subjectName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code</Label>
                <Input id="subjectCode" placeholder="MATH101" {...register('subjectCode')} />
                {errors.subjectCode && (
                  <p className="text-destructive text-xs">{errors.subjectCode.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Subject'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Subject List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !subjects || subjects.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No subjects found. Add one to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Subject Code</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((sub: SubjectItem) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.subjectName}</TableCell>
                      <TableCell>{sub.subjectCode}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(sub.id)}
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
