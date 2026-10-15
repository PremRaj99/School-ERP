import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PiMagnifyingGlass } from 'react-icons/pi';
import type { ClassSubjectRecord } from '@schoolerp/contracts';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminService } from '@/lib/services/admin.service';
import { getErrorMessage } from '@/lib/api';
import { qk } from '@/lib/query-keys';

interface AssignClassSubjectsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  classLabel: string;
  assigned: ClassSubjectRecord[];
}

export const AssignClassSubjectsDialog: React.FC<AssignClassSubjectsDialogProps> = ({
  open,
  onOpenChange,
  ...rest
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-lg">
      {/* DialogContent unmounts while closed, so the form's state re-seeds on every open. */}
      <AssignClassSubjectsForm onClose={() => onOpenChange(false)} {...rest} />
    </DialogContent>
  </Dialog>
);

const AssignClassSubjectsForm: React.FC<
  Omit<AssignClassSubjectsDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }
> = ({ onClose, classId, classLabel, assigned }) => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(assigned.map((s) => s.subjectCode)),
  );
  const [search, setSearch] = useState('');

  const { data: allSubjects, isLoading } = useQuery({
    queryKey: qk.admin.subjects(),
    queryFn: () => adminService.getSubjects(),
  });

  const scheduled = useMemo(
    () => new Map(assigned.map((s) => [s.subjectCode, s.scheduledPeriods])),
    [assigned],
  );

  const visible = useMemo(
    () =>
      [...(allSubjects ?? [])]
        .filter((s) =>
          `${s.subjectName} ${s.subjectCode}`.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((a, b) => a.subjectName.localeCompare(b.subjectName)),
    [allSubjects, search],
  );

  const saveMutation = useMutation({
    mutationFn: () => adminService.setClassSubjects(classId, Array.from(selected)),
    onSuccess: () => {
      toast.success('Class subjects updated');
      queryClient.invalidateQueries({ queryKey: qk.admin.classSubjects(classId) });
      queryClient.invalidateQueries({ queryKey: qk.admin.subjectsGrouped() });
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const toggle = (code: string, checked: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(code);
      else next.delete(code);
      return next;
    });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold">Assign Subjects</DialogTitle>
        <DialogDescription className="text-xs">
          Choose the subjects taught in Class {classLabel}. Subjects already scheduled in this
          class's timetable can't be removed here.
        </DialogDescription>
      </DialogHeader>

      <div className="relative">
        <PiMagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
        <Input
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>

      <div className="max-h-72 space-y-1 overflow-y-auto rounded-md border p-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-7 w-full" />)
        ) : visible.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-xs">
            {search ? 'No subjects match your search.' : 'No subjects exist yet.'}
          </p>
        ) : (
          visible.map((s) => {
            const periods = scheduled.get(s.subjectCode) ?? 0;
            const locked = periods > 0;
            return (
              <label
                key={s.subjectCode}
                className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs"
              >
                <Checkbox
                  checked={selected.has(s.subjectCode)}
                  disabled={locked}
                  onCheckedChange={(checked) => toggle(s.subjectCode, checked === true)}
                />
                <span className="flex-1 font-medium">{s.subjectName}</span>
                {locked && (
                  <span className="text-muted-foreground text-[10px]">
                    {periods} period{periods === 1 ? '' : 's'} scheduled
                  </span>
                )}
                <span className="text-muted-foreground font-mono text-[10px]">{s.subjectCode}</span>
              </label>
            );
          })
        )}
      </div>

      <DialogFooter className="pt-2">
        <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          className="bg-primary hover:bg-primary/90 text-xs text-white"
          disabled={saveMutation.isPending || isLoading}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? 'Saving...' : `Save (${selected.size} selected)`}
        </Button>
      </DialogFooter>
    </>
  );
};

export default AssignClassSubjectsDialog;
