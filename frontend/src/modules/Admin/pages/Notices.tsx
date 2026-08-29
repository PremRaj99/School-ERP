import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { TextField, DateField, SelectField } from '@/components/form';
import { adminService } from '@/lib/services/admin.service';
import { CreateNoticeBody, MAX_PAGE_SIZE } from '@schoolerp/contracts';
import { dateToIsoDate } from '@/lib/date';
import { getErrorMessage } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { toast } from 'sonner';
import {
  PiPlus,
  PiTrash,
  PiPencilSimple,
  PiCalendar,
  PiSparkle,
  PiMagnifyingGlass,
  PiFunnel,
} from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TARGET_ROLE_OPTIONS = [
  { value: 'All', label: 'All Campus Members' },
  { value: 'Student', label: 'Students Only' },
  { value: 'Teacher', label: 'Teaching Faculty Only' },
];

const emptyDefaults: CreateNoticeBody = {
  title: '',
  description: '',
  date: dateToIsoDate(new Date()),
  targetRole: 'All',
  expiryDate: '',
};

const isExpired = (expiryDate: string | null): boolean =>
  !!expiryDate && expiryDate < dateToIsoDate(new Date());

export const AdminNotices: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [targetFilter, setTargetFilter] = useState<'All' | 'Student' | 'Teacher'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Expired'>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { control, handleSubmit, reset } = useForm<CreateNoticeBody>({
    resolver: zodResolver(CreateNoticeBody),
    defaultValues: emptyDefaults,
  });

  // Fetches the full record (list rows omit description/fileUrl) to seed the edit form.
  const { data: editingNotice } = useQuery({
    queryKey: qk.admin.notice(editingNoticeId ?? ''),
    queryFn: () => adminService.getNoticeById(editingNoticeId!),
    enabled: !!editingNoticeId,
  });

  useEffect(() => {
    if (editingNotice) {
      reset({
        title: editingNotice.title,
        description: editingNotice.description ?? '',
        date: editingNotice.date,
        targetRole: editingNotice.targetRole,
        expiryDate: editingNotice.expiryDate ?? '',
      });
    }
  }, [editingNotice, reset]);

  // pageSize: MAX_PAGE_SIZE — card grid with client-side search, not `<DataTable>`; a school's
  // total notice count comfortably fits in one page (ALIGNMENT_PLAN.md 2C/P1).
  const {
    data: noticesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.notices({ pageSize: MAX_PAGE_SIZE }),
    queryFn: () => adminService.getNotices({ pageSize: MAX_PAGE_SIZE }),
  });
  const noticesList = noticesResponse?.data;

  const createMutation = useMutation({
    mutationFn: (payload: CreateNoticeBody) => adminService.createNotice(payload),
    onSuccess: () => {
      toast.success('Notice broadcasted successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.notices() });
      setIsCreateOpen(false);
      reset(emptyDefaults);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CreateNoticeBody) => adminService.updateNotice(editingNoticeId!, payload),
    onSuccess: () => {
      toast.success('Notice updated');
      queryClient.invalidateQueries({ queryKey: qk.admin.notices() });
      queryClient.invalidateQueries({ queryKey: qk.admin.notice(editingNoticeId!) });
      setEditingNoticeId(null);
      reset(emptyDefaults);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noticeId: string) => adminService.deleteNotice(noticeId),
    onSuccess: () => {
      toast.success('Notice removed');
      queryClient.invalidateQueries({ queryKey: qk.admin.notices() });
      setDeleteConfirmId(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const isEditDialogOpen = isCreateOpen || !!editingNoticeId;
  const closeDialog = () => {
    setIsCreateOpen(false);
    setEditingNoticeId(null);
  };

  const onSubmit: SubmitHandler<CreateNoticeBody> = (values) =>
    editingNoticeId ? updateMutation.mutate(values) : createMutation.mutate(values);

  const filteredNotices = (noticesList ?? []).filter((n) => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTarget =
      targetFilter === 'All' || n.targetRole === targetFilter || n.targetRole === 'All';
    const expired = isExpired(n.expiryDate);
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Active' && !expired) ||
      (statusFilter === 'Expired' && expired);
    return matchesSearch && matchesTarget && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Notices & Circulars</h1>
            <Badge variant="outline" className="text-xs">
              {filteredNotices.length} Published
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Announcements, exam notifications, and staff instructions for the school.
          </p>
        </div>

        <Button
          onClick={() => {
            reset(emptyDefaults);
            setIsCreateOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiPlus className="h-3.5 w-3.5" />
          <span>Broadcast Notice</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="relative w-full flex-1">
          <PiMagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search notices by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 pl-9 text-xs"
          />
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <PiFunnel className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
          <div className="flex items-center gap-1.5">
            {(['All', 'Active', 'Expired'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-1.5">
            {(['All', 'Student', 'Teacher'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setTargetFilter(role)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  targetFilter === role
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {role === 'All' ? 'All Roles' : `${role}s Only`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notices Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredNotices.length === 0 ? (
        <Empty className="rounded-md border p-8">
          <EmptyMedia illustration="notices" illustrationSize={120} />
          <EmptyTitle>No notices published yet</EmptyTitle>
          <EmptyDescription>
            {searchTerm || targetFilter !== 'All' || statusFilter !== 'All'
              ? 'No notices match your filters.'
              : 'Publish the first notice for students or staff.'}
          </EmptyDescription>
          {!searchTerm && targetFilter === 'All' && statusFilter === 'All' && (
            <Button size="sm" className="mt-1 text-xs" onClick={() => setIsCreateOpen(true)}>
              <PiPlus className="mr-1 h-3.5 w-3.5" />
              Broadcast Notice
            </Button>
          )}
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredNotices.map((notice, idx) => {
            const noticeId = notice.id || `notice-${idx}`;
            return (
              <Card
                key={noticeId}
                className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="bg-muted text-muted-foreground text-[10px] font-semibold"
                      >
                        Audience: {notice.targetRole}
                      </Badge>
                      {notice.expiryDate && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${
                            isExpired(notice.expiryDate)
                              ? 'border-rose-500/30 text-rose-700 dark:text-rose-300'
                              : 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {isExpired(notice.expiryDate) ? 'Expired' : 'Active'}
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <PiCalendar className="text-primary h-3 w-3" />
                      <span>{notice.date}</span>
                    </span>
                  </div>

                  <CardTitle className="mt-2 text-base leading-snug font-bold text-slate-900 dark:text-white">
                    {notice.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pt-0 text-xs">
                  {/* The list endpoint only returns title/date/targetRole — full body and expiry
                    live on the detail view (not wired into this card yet). */}
                  <p className="text-muted-foreground leading-relaxed">
                    Notice for the selected audience — open Edit to view full details.
                  </p>

                  <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-2 dark:border-zinc-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setEditingNoticeId(noticeId)}
                    >
                      <PiPencilSimple className="mr-1 h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                      onClick={() => setDeleteConfirmId(noticeId)}
                    >
                      <PiTrash className="mr-1 h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiSparkle className="h-4 w-4" />
              <span>Notice Board</span>
            </div>
            <DialogTitle className="text-lg font-bold">
              {editingNoticeId ? 'Edit Notice' : 'Publish Notice'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingNoticeId
                ? 'Update this announcement — changes are visible immediately on every portal it targets.'
                : 'Create an announcement that will be displayed on designated portal dashboards.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <TextField
              control={control}
              name="title"
              label="Notice Title"
              required
              placeholder="e.g. Annual Sports & Athletics Meet 2026"
            />

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                control={control}
                name="targetRole"
                label="Target Audience"
                required
                options={TARGET_ROLE_OPTIONS}
              />
              <DateField control={control} name="expiryDate" label="Expiry Date" />
            </div>

            <TextField
              control={control}
              name="description"
              label="Notice Details"
              required
              multiline
              placeholder="Please state the complete announcement details, instructions, dates, and venues..."
            />

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" onClick={closeDialog} className="h-9 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
              >
                {editingNoticeId
                  ? updateMutation.isPending
                    ? 'Saving...'
                    : 'Save Changes'
                  : createMutation.isPending
                    ? 'Publishing...'
                    : 'Broadcast Notice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <PiTrash className="h-4 w-4" />
              <span>Delete Notice</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to delete this notice? It will be removed from all user
              dashboards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Notice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotices;
