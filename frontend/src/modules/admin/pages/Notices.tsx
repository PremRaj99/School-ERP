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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Trash2, PlusCircle, Loader2, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface NoticeItem {
  id: string;
  title: string;
  content?: string;
  description?: string;
  date: string;
}
interface ApiError {
  response?: { data?: { message?: string } };
}

const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

type NoticeFormValues = z.infer<typeof noticeSchema>;

export default function Notices() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notices, isLoading } = useQuery({
    queryKey: ['admin', 'notices'],
    queryFn: adminService.getNotices,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] });
      toast.success('Notice published successfully!');
      setOpen(false);
      reset();
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to publish notice.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notices'] });
      toast.success('Notice deleted successfully!');
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to delete notice.');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NoticeFormValues>({
    resolver: zodResolver(noticeSchema),
  });

  const onSubmit = (data: NoticeFormValues) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notice Board</h2>
          <p className="text-muted-foreground">
            Publish announcements, alerts, and alerts for school updates.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Publish Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Publish New Announcement</DialogTitle>
              <DialogDescription>
                Create a notice visible to all students and teachers.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notice Title</Label>
                <Input id="title" placeholder="School Holiday Notice" {...register('title')} />
                {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Notice Content</Label>
                <textarea
                  id="content"
                  rows={4}
                  placeholder="The school will remain closed on..."
                  className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('content')}
                />
                {errors.content && (
                  <p className="text-destructive text-xs">{errors.content.message}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Publishing...' : 'Publish'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : !notices || notices.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">No active notices listed.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notices.map((notice: NoticeItem) => (
            <Card key={notice.id} className="border-border flex flex-col justify-between shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <div className="text-primary flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span className="text-xs font-semibold tracking-wider uppercase">
                      Announcement
                    </span>
                  </div>
                  <CardTitle className="text-lg font-bold">{notice.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(notice.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="text-muted-foreground flex-1 pt-2 text-sm">
                <p className="whitespace-pre-wrap">{notice.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
