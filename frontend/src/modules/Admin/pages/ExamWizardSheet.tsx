import { useState } from 'react';
import { useForm, useFieldArray, type Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { TextField, DateField, NumberField, SelectField } from '@/components/form';
import {
  useClassNameOptions,
  useSectionOptions,
  useSubjectOptions,
} from '@/hooks/options/useAdminOptions';
import { CreateExamBody } from '@schoolerp/contracts';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import {
  PiArrowLeft,
  PiArrowRight,
  PiPlus,
  PiSparkle,
  PiTrash,
  PiMedal,
  PiClipboardText,
} from 'react-icons/pi';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const STEPS = ['Details', 'Class Groups', 'Subjects', 'Review'] as const;

const emptyDefaults: CreateExamBody = { title: '', dateFrom: '', dateTo: '', exams: [] };

/**
 * The multi-step exam scheduling wizard (ALIGNMENT_PLAN.md §3.3, "the nested-payload fix" +
 * Phase 5's headline UI work) — replaces the old single-class-group, fixed-subjects Dialog form
 * with the real thing: (1) title + date range, (2) add class groups via cascading class/section
 * selects, (3) per-group subject rows (subject select + date + full marks), (4) review, matching
 * `CreateExamBody`'s nested `{title, dateFrom, dateTo, exams: [{className, section, subjects[]}]}`
 * shape exactly — one `POST /admin/exam` call creates every group in one go.
 */
export function ExamWizardSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [newGroupClassName, setNewGroupClassName] = useState('');
  const [newGroupSection, setNewGroupSection] = useState('');

  const classNameOptions = useClassNameOptions();
  const sectionOptions = useSectionOptions(newGroupClassName);
  const subjectOptions = useSubjectOptions();

  const { control, handleSubmit, watch, reset, getValues } = useForm<CreateExamBody>({
    resolver: zodResolver(CreateExamBody),
    defaultValues: emptyDefaults,
  });
  const {
    fields: groupFields,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control,
    name: 'exams',
  });
  const watchedTitle = watch('title');
  const watchedDateFrom = watch('dateFrom');
  const watchedDateTo = watch('dateTo');
  const watchedGroups = watch('exams');

  const createMutation = useMutation({
    mutationFn: (payload: CreateExamBody) => adminService.createExam(payload),
    onSuccess: (created) => {
      toast.success(`${created.length} exam schedule${created.length === 1 ? '' : 's'} published!`);
      queryClient.invalidateQueries({ queryKey: qk.admin.exams() });
      close();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const close = () => {
    onOpenChange(false);
    setStep(0);
    setNewGroupClassName('');
    setNewGroupSection('');
    reset(emptyDefaults);
  };

  const addGroup = () => {
    if (!newGroupClassName || !newGroupSection) return;
    const exists = getValues('exams').some(
      (g) => g.className === newGroupClassName && g.section === newGroupSection,
    );
    if (exists) {
      toast.error('That class-section is already in this exam.');
      return;
    }
    appendGroup({ className: newGroupClassName, section: newGroupSection, subjects: [] });
    setNewGroupClassName('');
    setNewGroupSection('');
  };

  const canProceedFromStep = (s: number): boolean => {
    if (s === 0) return watchedTitle.trim().length >= 3 && !!watchedDateFrom && !!watchedDateTo;
    if (s === 1) return watchedGroups.length > 0;
    if (s === 2) return watchedGroups.every((g) => g.subjects.length > 0);
    return true;
  };

  const onSubmit = (values: CreateExamBody) => createMutation.mutate(values);

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent className="sm:max-w-3xl lg:max-w-4xl">
        <div className="space-y-5 p-2">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiSparkle className="h-4 w-4" />
              <span>Exam Controller Office</span>
            </div>
            <DialogTitle className="text-lg font-bold">Schedule Term Examination</DialogTitle>
            <DialogDescription className="text-xs">
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((label, i) => (
              <div key={label} className="flex flex-1 items-center gap-1.5">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    i < step
                      ? 'bg-emerald-600 text-white'
                      : i === step
                        ? 'bg-primary text-white'
                        : 'bg-slate-100 text-slate-400 dark:bg-zinc-800'
                  }`}
                >
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${i < step ? 'bg-emerald-600' : 'bg-slate-100 dark:bg-zinc-800'}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Details */}
          {step === 0 && (
            <div className="space-y-4">
              <TextField
                control={control}
                name="title"
                label="Exam Title"
                required
                placeholder="e.g. Mid-Term Examination 2025-2026"
              />
              <div className="grid grid-cols-2 gap-3">
                <DateField control={control} name="dateFrom" label="Start Date" required />
                <DateField control={control} name="dateTo" label="End Date" required />
              </div>
            </div>
          )}

          {/* Step 2: Class Groups */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-end gap-2 rounded-md border border-dashed border-slate-300 p-3 dark:border-zinc-700">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold">Class</label>
                  <NativeSelect
                    value={newGroupClassName}
                    onChange={(e) => {
                      setNewGroupClassName(e.target.value);
                      setNewGroupSection('');
                    }}
                    className="h-9 text-xs"
                  >
                    <NativeSelectOption value="" disabled>
                      Select…
                    </NativeSelectOption>
                    {classNameOptions.map((opt) => (
                      <NativeSelectOption key={opt.value} value={opt.value}>
                        {opt.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold">Section</label>
                  <NativeSelect
                    value={newGroupSection}
                    onChange={(e) => setNewGroupSection(e.target.value)}
                    disabled={!newGroupClassName}
                    className="h-9 text-xs"
                  >
                    <NativeSelectOption value="" disabled>
                      {newGroupClassName ? 'Select…' : 'Pick a class first'}
                    </NativeSelectOption>
                    {sectionOptions.map((opt) => (
                      <NativeSelectOption key={opt.value} value={opt.value}>
                        {opt.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <Button
                  type="button"
                  size="sm"
                  className="h-9 shrink-0 text-xs"
                  disabled={!newGroupClassName || !newGroupSection}
                  onClick={addGroup}
                >
                  <PiPlus className="mr-1 h-3.5 w-3.5" />
                  Add Group
                </Button>
              </div>

              {groupFields.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-xs">
                  No class groups added yet. Add at least one to continue.
                </p>
              ) : (
                <div className="space-y-2">
                  {groupFields.map((group, index) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs dark:bg-zinc-800/50"
                    >
                      <span className="font-semibold">
                        Class {group.className}-{group.section}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-rose-600"
                        onClick={() => removeGroup(index)}
                      >
                        <PiTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Subjects per group */}
          {step === 2 && (
            <div className="space-y-4">
              {groupFields.map((group, groupIndex) => (
                <ExamGroupSubjects
                  key={group.id}
                  control={control}
                  groupIndex={groupIndex}
                  className={group.className}
                  section={group.section}
                  subjectOptions={subjectOptions}
                />
              ))}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 3 && (
            <div className="space-y-3">
              <Card className="border border-slate-200/80 dark:border-zinc-800">
                <CardContent className="space-y-1 p-3 text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{watchedTitle}</p>
                  <p className="text-muted-foreground">
                    {watchedDateFrom} to {watchedDateTo}
                  </p>
                </CardContent>
              </Card>
              {watchedGroups.map((group, i) => (
                <Card key={i} className="border border-slate-200/80 dark:border-zinc-800">
                  <CardContent className="space-y-2 p-3 text-xs">
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      Class {group.className}-{group.section}
                    </Badge>
                    <ul className="space-y-1">
                      {group.subjects.map((s, j) => (
                        <li key={j} className="text-muted-foreground flex justify-between">
                          <span>
                            {subjectOptions.find((o) => o.value === s.subjectCode)?.label ??
                              s.subjectCode}
                          </span>
                          <span>
                            {s.date} · {s.fullMarks} marks
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between border-t border-slate-100 pt-4 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={() => (step === 0 ? close() : setStep((s) => s - 1))}
            >
              <PiArrowLeft className="mr-1 h-3.5 w-3.5" />
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                size="sm"
                className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
                disabled={!canProceedFromStep(step)}
                onClick={() => setStep((s) => s + 1)}
              >
                Next
                <PiArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
                disabled={createMutation.isPending}
                onClick={handleSubmit(onSubmit)}
              >
                <PiMedal className="mr-1.5 h-3.5 w-3.5" />
                {createMutation.isPending ? 'Publishing...' : 'Publish Exam Schedule'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** One class group's subject rows — its own `useFieldArray` for `exams.${groupIndex}.subjects`. */
function ExamGroupSubjects({
  control,
  groupIndex,
  className,
  section,
  subjectOptions,
}: {
  control: Control<CreateExamBody>;
  groupIndex: number;
  className: string;
  section: string;
  subjectOptions: { value: string; label: string }[];
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exams.${groupIndex}.subjects`,
  });

  return (
    <Card className="border border-slate-200/80 dark:border-zinc-800">
      <CardContent className="space-y-3 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <PiClipboardText className="text-primary h-3.5 w-3.5" />
            <span>
              Class {className}-{section}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => append({ subjectCode: '', date: '', fullMarks: 100 })}
          >
            <PiPlus className="mr-1 h-3 w-3" />
            Add Subject
          </Button>
        </div>

        {fields.length === 0 ? (
          <p className="text-muted-foreground py-2 text-center text-xs">
            No subjects added for this class group yet.
          </p>
        ) : (
          <div className="space-y-2">
            {fields.map((field, subjectIndex) => (
              <div key={field.id} className="flex items-end gap-2">
                <div className="flex-2">
                  <SelectField
                    control={control}
                    name={`exams.${groupIndex}.subjects.${subjectIndex}.subjectCode`}
                    label="Subject"
                    options={subjectOptions}
                  />
                </div>
                <div className="flex-1">
                  <DateField
                    control={control}
                    name={`exams.${groupIndex}.subjects.${subjectIndex}.date`}
                    label="Date"
                  />
                </div>
                <div className="flex-1">
                  <NumberField
                    control={control}
                    name={`exams.${groupIndex}.subjects.${subjectIndex}.fullMarks`}
                    label="Full Marks"
                    min={0}
                    max={100}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mb-1 h-8 w-8 shrink-0 text-rose-600"
                  onClick={() => remove(subjectIndex)}
                >
                  <PiTrash className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
