import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import type { SubjectItem, CreateSubjectPayload } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { BookOpen, Plus, Trash2, Edit2, Search, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const sampleSubjects: SubjectItem[] = [
  { subjectCode: 'MATH101', subjectName: 'Mathematics & Applied Algebra' },
  { subjectCode: 'PHY201', subjectName: 'General & Experimental Physics' },
  { subjectCode: 'CHEM301', subjectName: 'Inorganic & Organic Chemistry' },
  { subjectCode: 'BIO401', subjectName: 'Biology & Life Sciences' },
  { subjectCode: 'ENG001', subjectName: 'English Literature & Composition' },
  { subjectCode: 'HIST102', subjectName: 'World History & Civics' },
  { subjectCode: 'CS501', subjectName: 'Computer Science & Python' },
  { subjectCode: 'ECON601', subjectName: 'Macroeconomics & Commerce' },
];

export const AdminSubjects: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateSubjectPayload>({
    subjectName: '',
    subjectCode: '',
  });

  const { data: apiSubjects } = useQuery({
    queryKey: ['adminSubjects'],
    queryFn: () => adminService.getSubjects(),
  });

  const subjectsList: SubjectItem[] = useMemo(() => {
    if (apiSubjects?.data && Array.isArray(apiSubjects.data) && apiSubjects.data.length > 0) {
      return apiSubjects.data;
    }
    return sampleSubjects;
  }, [apiSubjects]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateSubjectPayload) => adminService.createSubject(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Subject added successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminSubjects'] });
      setIsCreateOpen(false);
      setFormData({ subjectName: '', subjectCode: '' });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ code, name }: { code: string; name: string }) =>
      adminService.updateSubject(code, { subjectName: name }),
    onSuccess: (res) => {
      toast.success(res.message || 'Subject updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminSubjects'] });
      setEditingSubject(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (code: string) => adminService.deleteSubject(code),
    onSuccess: () => {
      toast.success('Subject removed');
      queryClient.invalidateQueries({ queryKey: ['adminSubjects'] });
      setDeleteConfirmCode(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateMutation.mutate({
        code: editingSubject.subjectCode,
        name: editingSubject.subjectName,
      });
    }
  };

  const filteredSubjects = subjectsList.filter((s) =>
    `${s.subjectName} ${s.subjectCode}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Academic Curriculum Subjects</h1>
            <Badge variant="outline" className="text-xs">
              {filteredSubjects.length} Registered Subjects
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Manage course disciplines, subject identifiers, and curriculum syllabi.
          </p>
        </div>

        <Button
          onClick={() => {
            setFormData({ subjectName: '', subjectCode: '' });
            setIsCreateOpen(true);
          }}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Subject</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search by subject name or code (e.g. MATH101, Physics)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredSubjects.map((sub) => (
          <Card
            key={sub.subjectCode}
            className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-indigo-50 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                >
                  {sub.subjectCode}
                </Badge>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-indigo-600 dark:bg-zinc-800 dark:text-indigo-400">
                  <BookOpen className="h-3.5 w-3.5" />
                </div>
              </div>
              <CardTitle className="mt-2 text-base leading-snug font-bold text-slate-900 dark:text-white">
                {sub.subjectName}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
              <div className="text-muted-foreground flex items-center justify-between rounded-lg bg-slate-50 p-2 text-[11px] dark:bg-zinc-800/50">
                <span>Curriculum Credits</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">4.0 Credits</span>
              </div>

              <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-1 dark:border-zinc-800">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                  onClick={() => setEditingSubject(sub)}
                  title="Edit Subject"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                  onClick={() => setDeleteConfirmCode(sub.subjectCode)}
                  title="Delete Subject"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Subject Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>Curriculum Registry</span>
            </div>
            <DialogTitle className="text-lg font-bold">Add New Course Subject</DialogTitle>
            <DialogDescription className="text-xs">
              Define the course title and optional custom subject code.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="sName" className="text-xs font-semibold">
                Subject Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="sName"
                placeholder="e.g. Environmental Science"
                value={formData.subjectName}
                onChange={(e) => setFormData((prev) => ({ ...prev, subjectName: e.target.value }))}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sCode" className="text-xs font-semibold">
                Subject Code (Optional, auto-assigned if empty)
              </Label>
              <Input
                id="sCode"
                placeholder="e.g. ENV101"
                value={formData.subjectCode}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subjectCode: e.target.value.toUpperCase() }))
                }
                className="h-9 text-xs uppercase"
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
                {createMutation.isPending ? 'Adding...' : 'Add Subject'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Update Subject: {editingSubject?.subjectCode}
            </DialogTitle>
          </DialogHeader>

          {editingSubject && (
            <form onSubmit={handleUpdateSubmit} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label htmlFor="editName" className="text-xs font-semibold">
                  Subject Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="editName"
                  value={editingSubject.subjectName}
                  onChange={(e) =>
                    setEditingSubject((prev) =>
                      prev ? { ...prev, subjectName: e.target.value } : null,
                    )
                  }
                  required
                  className="h-9 text-xs"
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSubject(null)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmCode} onOpenChange={() => setDeleteConfirmCode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <Trash2 className="h-4 w-4" />
              <span>Confirm Subject Removal</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to remove subject code <strong>{deleteConfirmCode}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmCode(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteConfirmCode && deleteMutation.mutate(deleteConfirmCode)}
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Subject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubjects;
