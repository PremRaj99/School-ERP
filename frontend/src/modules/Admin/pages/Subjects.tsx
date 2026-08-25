import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { adminService } from '@/lib/services/admin.service';
import type { SubjectRecord, CreateSubjectBody } from '@schoolerp/contracts';
import { getErrorMessage } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { toast } from 'sonner';
import {
  PiBookOpen,
  PiPlus,
  PiTrash,
  PiPencilSimpleLine,
  PiMagnifyingGlass,
  PiSparkle,
  PiListBullets,
  PiGitBranch,
  PiChalkboard,
} from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const AdminSubjects: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectRecord | null>(null);
  const [deleteConfirmCode, setDeleteConfirmCode] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateSubjectBody>({
    subjectName: '',
    subjectCode: '',
  });

  const {
    data: subjectsList,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.subjects(),
    queryFn: () => adminService.getSubjects(),
  });

  const {
    data: groupedSubjects,
    isLoading: groupedLoading,
    isError: groupedErrored,
    error: groupedError,
    refetch: refetchGrouped,
  } = useQuery({
    queryKey: qk.admin.subjectsGrouped(),
    queryFn: () => adminService.getAllClassSubjects(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSubjectBody) => adminService.createSubject(payload),
    onSuccess: () => {
      toast.success('Subject added successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.subjects() });
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
    onSuccess: () => {
      toast.success('Subject updated successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.subjects() });
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
      queryClient.invalidateQueries({ queryKey: qk.admin.subjects() });
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

  const filteredSubjects = (subjectsList ?? []).filter((s) =>
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
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiPlus className="h-3.5 w-3.5" />
          <span>Add Subject</span>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="h-10 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="all" className="rounded-md px-4 text-xs font-semibold">
            <PiListBullets className="mr-1.5 h-3.5 w-3.5" />
            <span>All Subjects</span>
          </TabsTrigger>
          <TabsTrigger value="byClass" className="rounded-md px-4 text-xs font-semibold">
            <PiGitBranch className="mr-1.5 h-3.5 w-3.5" />
            <span>Assigned by Class</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 pt-4 focus:outline-hidden">
          {/* Search Bar */}
          <div className="relative w-full">
            <PiMagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search by subject name or code (e.g. MATH101, Physics)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>

          {/* Subjects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-full" />
              ))}
            </div>
          ) : isError ? (
            <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
          ) : filteredSubjects.length === 0 ? (
            <Empty className="rounded-md border p-8">
              <EmptyMedia illustration="subjects" illustrationSize={120} />
              <EmptyTitle>No subjects yet</EmptyTitle>
              <EmptyDescription>
                {searchTerm
                  ? 'No subjects match your search.'
                  : 'Add the first subject to get started.'}
              </EmptyDescription>
              {!searchTerm && (
                <Button
                  size="sm"
                  className="mt-1 text-xs"
                  onClick={() => {
                    setFormData({ subjectName: '', subjectCode: '' });
                    setIsCreateOpen(true);
                  }}
                >
                  <PiPlus className="mr-1 h-3.5 w-3.5" />
                  Add Subject
                </Button>
              )}
            </Empty>
          ) : (
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
                        className="bg-muted text-muted-foreground font-mono text-[10px] font-bold"
                      >
                        {sub.subjectCode}
                      </Badge>
                      <div className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-md">
                        <PiBookOpen className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <CardTitle className="mt-2 text-base leading-snug font-bold text-slate-900 dark:text-white">
                      {sub.subjectName}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-1 dark:border-zinc-800">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:bg-primary/10 h-7 w-7"
                        onClick={() => setEditingSubject(sub)}
                        title="Edit Subject"
                      >
                        <PiPencilSimpleLine className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-600 hover:bg-rose-50 dark:text-rose-400"
                        onClick={() => setDeleteConfirmCode(sub.subjectCode)}
                        title="Delete Subject"
                      >
                        <PiTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Assigned-by-class two-panel view */}
        <TabsContent value="byClass" className="pt-4 focus:outline-hidden">
          {groupedLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : groupedErrored ? (
            <ErrorState
              description={getErrorMessage(groupedError)}
              onRetry={() => refetchGrouped()}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Assigned */}
              <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                    <PiChalkboard className="text-primary h-4 w-4" />
                    Assigned to a Class
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(groupedSubjects?.assignedSubjects ?? []).length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-xs">
                      No subjects are assigned to a class yet.
                    </p>
                  ) : (
                    groupedSubjects?.assignedSubjects.map((group) => (
                      <div
                        key={group.className}
                        className="rounded-md border border-slate-100 p-3 dark:border-zinc-800"
                      >
                        <Badge variant="secondary" className="mb-2 text-[10px] font-semibold">
                          Class {group.className}
                        </Badge>
                        <div className="flex flex-wrap gap-1.5">
                          {group.subjects.map((s) => (
                            <Badge
                              key={s.subjectCode}
                              variant="outline"
                              className="text-[10px] font-medium"
                            >
                              <PiBookOpen className="text-primary mr-1 h-2.5 w-2.5" />
                              {s.subjectName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Unassigned */}
              <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                    <PiBookOpen className="h-4 w-4 text-amber-500" />
                    Not Yet Assigned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(groupedSubjects?.unassignedSubjects ?? []).length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-xs">
                      Every subject is assigned to at least one class.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {groupedSubjects?.unassignedSubjects.map((s) => (
                        <Badge
                          key={s.subjectCode}
                          variant="outline"
                          className="bg-amber-50 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                        >
                          {s.subjectName}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Subject Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiSparkle className="h-4 w-4" />
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
                className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Subject'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Modal */}
      <Dialog open={!!editingSubject} onOpenChange={() => setEditingSubject(null)}>
        <DialogContent className="sm:max-w-lg">
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
                  className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
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
              <PiTrash className="h-4 w-4" />
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
