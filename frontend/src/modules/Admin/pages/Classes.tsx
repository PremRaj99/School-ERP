import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import type { ClassItem, CreateClassPayload } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Trash2, Users, Sparkles, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const sampleClasses: ClassItem[] = [
  { id: '1', className: '10', section: 'A', session: '2025-2026' },
  { id: '2', className: '10', section: 'B', session: '2025-2026' },
  { id: '3', className: '9', section: 'A', session: '2025-2026' },
  { id: '4', className: '9', section: 'B', session: '2025-2026' },
  { id: '5', className: '8', section: 'A', session: '2025-2026' },
  { id: '6', className: '11', section: 'A', session: '2025-2026' },
  { id: '7', className: '12', section: 'A', session: '2025-2026' },
];

export const AdminClasses: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateClassPayload>({
    className: '10',
    section: 'C',
    session: '2025-2026',
  });

  const { data: apiClasses } = useQuery({
    queryKey: ['adminClasses'],
    queryFn: () => adminService.getClasses(),
  });

  const classesList: ClassItem[] = useMemo(() => {
    if (apiClasses?.data && Array.isArray(apiClasses.data) && apiClasses.data.length > 0) {
      return apiClasses.data;
    }
    return sampleClasses;
  }, [apiClasses]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateClassPayload) => adminService.createClass(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Class created successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
      setIsCreateOpen(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (classId: string) => adminService.deleteClass(classId),
    onSuccess: () => {
      toast.success('Class section removed');
      queryClient.invalidateQueries({ queryKey: ['adminClasses'] });
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

  const filteredClasses = classesList.filter((c) =>
    `Class ${c.className}-${c.section} ${c.session}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Classes & Sections</h1>
            <Badge variant="outline" className="text-xs">
              {filteredClasses.length} Active Sections
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Configure academic class tiers, sections, and active operational academic sessions.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add New Class Section</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search class sections (e.g. Class 10-A, 2025-2026)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredClasses.map((cls, idx) => {
          const classId = cls.id || cls._id || `class-${idx}`;
          return (
            <Card
              key={classId}
              className="group relative overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
            >
              <div className="h-2 w-full bg-linear-to-r from-indigo-500 to-violet-600" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-xs">{cls.session}</span>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-50 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                  >
                    Sec {cls.section}
                  </Badge>
                </div>
                <CardTitle className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  Class {cls.className} - {cls.section}
                </CardTitle>
                <CardDescription className="text-xs">
                  Academic Session: {cls.session}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-2">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-zinc-800/50">
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Est. Students</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-zinc-100">40 Enrolled</span>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
                    onClick={() => setDeleteConfirmId(classId)}
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    <span>Remove</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Class Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>Curriculum Setup</span>
            </div>
            <DialogTitle className="text-lg font-bold">Create Class Section</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new class and section pair to the institutional database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="cName" className="text-xs font-semibold">
                Class Grade (e.g. 10, 11, 12) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="cName"
                placeholder="10"
                value={formData.className}
                onChange={(e) => setFormData((prev) => ({ ...prev, className: e.target.value }))}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cSection" className="text-xs font-semibold">
                Section Code (Single Letter A-Z) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="cSection"
                placeholder="A"
                maxLength={1}
                value={formData.section}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, section: e.target.value.toUpperCase() }))
                }
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="cSession" className="text-xs font-semibold">
                Academic Session (YYYY-YYYY) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="cSession"
                placeholder="2025-2026"
                value={formData.session}
                onChange={(e) => setFormData((prev) => ({ ...prev, session: e.target.value }))}
                required
                className="h-9 text-xs"
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
                {createMutation.isPending ? 'Creating...' : 'Create Class'}
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
              <span>Confirm Class Section Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to delete this class section?
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
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Class'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClasses;
