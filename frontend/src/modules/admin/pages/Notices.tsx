import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService } from '@/lib/services/admin.service';
import type { Notice, CreateNoticePayload } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Calendar, Sparkles, Search, Filter } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const sampleNotices: Notice[] = [
  {
    id: 'not-1',
    title: 'Annual Sports & Athletics Meet 2026',
    description:
      'Trials and selection for inter-house track and field events will commence next Monday at the main stadium.',
    targetRole: 'All',
    date: '10-04-2025',
    expiryDate: '25-04-2025',
  },
  {
    id: 'not-2',
    title: 'Quarterly Examination Schedule Released',
    description:
      'The finalized date sheet for Classes 6 through 12 has been published. Please ensure student hall tickets are verified.',
    targetRole: 'Student',
    date: '08-04-2025',
    expiryDate: '30-04-2025',
  },
  {
    id: 'not-3',
    title: 'Faculty Academic Council Review Meeting',
    description:
      'All department heads and teaching faculty are requested to assemble in the Conference Hall for syllabus progression review.',
    targetRole: 'Teacher',
    date: '05-04-2025',
    expiryDate: '15-04-2025',
  },
  {
    id: 'not-4',
    title: 'Fee Payment Reminders for Term 1',
    description:
      'Parents and students are requested to clear all pending quarterly tuition dues before the scheduled examination series.',
    targetRole: 'Student',
    date: '01-04-2025',
    expiryDate: '20-04-2025',
  },
];

export const AdminNotices: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [targetFilter, setTargetFilter] = useState<'All' | 'Student' | 'Teacher'>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateNoticePayload>({
    title: '',
    description: '',
    targetRole: 'All',
    expiryDate: '30-04-2025',
  });

  const { data: apiNotices } = useQuery({
    queryKey: ['adminNotices'],
    queryFn: () => adminService.getNotices(),
  });

  const noticesList: Notice[] = useMemo(() => {
    if (apiNotices?.data && Array.isArray(apiNotices.data) && apiNotices.data.length > 0) {
      return apiNotices.data;
    }
    return sampleNotices;
  }, [apiNotices]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateNoticePayload) => adminService.createNotice(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Notice broadcasted successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminNotices'] });
      setIsCreateOpen(false);
      setFormData({ title: '', description: '', targetRole: 'All', expiryDate: '' });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noticeId: string) => adminService.deleteNotice(noticeId),
    onSuccess: () => {
      toast.success('Notice removed');
      queryClient.invalidateQueries({ queryKey: ['adminNotices'] });
      setDeleteConfirmId(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredNotices = noticesList.filter((n) => {
    const matchesSearch = `${n.title} ${n.description || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTarget =
      targetFilter === 'All' || n.targetRole === targetFilter || n.targetRole === 'All';
    return matchesSearch && matchesTarget;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Institutional Circulars & Notices
            </h1>
            <Badge variant="outline" className="text-xs">
              {filteredNotices.length} Published Bulletins
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Broadcast school-wide announcements, exam notifications, and staff directives.
          </p>
        </div>

        <Button
          onClick={() => {
            setFormData({ title: '', description: '', targetRole: 'All', expiryDate: '' });
            setIsCreateOpen(true);
          }}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Broadcast Notice</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
          <div className="relative w-full flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search circulars by headline or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Filter className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <div className="flex items-center gap-1.5">
              {(['All', 'Student', 'Teacher'] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setTargetFilter(role)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    targetFilter === role
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {role === 'All' ? 'All Roles' : `${role}s Only`}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredNotices.map((notice, idx) => {
          const noticeId = notice.id || notice._id || `notice-${idx}`;
          return (
            <Card
              key={noticeId}
              className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-semibold ${
                        notice.targetRole === 'All'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : notice.targetRole === 'Teacher'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                      }`}
                    >
                      Audience: {notice.targetRole}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Calendar className="h-3 w-3 text-indigo-500" />
                    <span>{notice.date}</span>
                  </span>
                </div>

                <CardTitle className="mt-2 text-base leading-snug font-bold text-slate-900 dark:text-white">
                  {notice.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 pt-0 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  {notice.description ||
                    'Official institutional communication for designated campus members.'}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-zinc-800">
                  <span className="text-muted-foreground text-[10px]">
                    Expires: {notice.expiryDate || 'Active indefinitely'}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                    onClick={() => setDeleteConfirmId(noticeId)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Broadcast Notice Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>Institutional Broadcast</span>
            </div>
            <DialogTitle className="text-lg font-bold">Publish Official Notice</DialogTitle>
            <DialogDescription className="text-xs">
              Create an announcement that will be displayed on designated portal dashboards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="nTitle" className="text-xs font-semibold">
                Circular Title / Headline <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="nTitle"
                placeholder="e.g. Annual Sports & Athletics Meet 2026"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="nTarget" className="text-xs font-semibold">
                  Target Audience <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="nTarget"
                  value={formData.targetRole}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetRole: e.target.value as 'All' | 'Student' | 'Teacher',
                    }))
                  }
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="All">All Campus Members</option>
                  <option value="Student">Students Only</option>
                  <option value="Teacher">Teaching Faculty Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="nExpiry" className="text-xs font-semibold">
                  Expiry Date (DD-MM-YYYY)
                </Label>
                <Input
                  id="nExpiry"
                  placeholder="30-04-2025"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="nDesc" className="text-xs font-semibold">
                Circular Body / Details <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="nDesc"
                placeholder="Please state the complete announcement details, instructions, dates, and venues..."
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
                className="text-xs leading-relaxed"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
              >
                {createMutation.isPending ? 'Publishing...' : 'Broadcast Notice'}
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
              <Trash2 className="h-4 w-4" />
              <span>Confirm Circular Removal</span>
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
