import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { useSubjectOptions, useTeacherOptions } from '@/hooks/options/useAdminOptions';
import type { CreateCalendarEventBody, WeekDay } from '@schoolerp/contracts';
import { toast } from 'sonner';
import {
  PiCalendar,
  PiClock,
  PiPlus,
  PiTrash,
  PiSparkle,
  PiPencilSimple,
  PiWarning,
} from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const WEEKDAYS: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

interface EditingCell {
  weekday: WeekDay;
  period: number;
  subjectCode: string;
  teacherId: string;
}

export const AdminAcademic: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const [eventFormData, setEventFormData] = useState<CreateCalendarEventBody>({
    title: '',
    date: '2025-08-15',
    category: 'HOLIDAY',
  });

  const {
    data: calendarEvents,
    isLoading: calendarLoading,
    isError: calendarErrored,
    error: calendarError,
    refetch: refetchCalendar,
  } = useQuery({
    queryKey: qk.admin.calendar(),
    queryFn: () => adminService.getCalendar(),
  });

  const {
    data: classSchedules,
    isLoading: timetableLoading,
    isError: timetableErrored,
    error: timetableError,
    refetch: refetchTimetable,
  } = useQuery({
    queryKey: qk.admin.timetable(),
    queryFn: () => adminService.getTimetable(),
  });

  const classOptions = (classSchedules ?? []).map((c) => `${c.className}-${c.section}`);
  const activeClass = selectedClass ?? classOptions[0] ?? null;
  const activeSchedule = classSchedules?.find((c) => `${c.className}-${c.section}` === activeClass);

  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const subjectOptions = useSubjectOptions();
  const teacherOptions = useTeacherOptions();

  const slotAt = (weekday: WeekDay, period: number) =>
    activeSchedule?.schedule
      .find((d) => d.weekday === weekday)
      ?.periods.find((p) => p.periodNumber === period);

  /** A teacher already teaching a *different* class-section at this exact weekday+period. */
  const findConflict = (weekday: WeekDay, period: number, teacherId: string) => {
    if (!teacherId) return null;
    for (const cls of classSchedules ?? []) {
      if (cls.className === activeSchedule?.className && cls.section === activeSchedule?.section)
        continue;
      const hit = cls.schedule
        .find((d) => d.weekday === weekday)
        ?.periods.find((p) => p.periodNumber === period && p.teacherId === teacherId);
      if (hit)
        return { className: cls.className, section: cls.section, teacherName: hit.teacherFullName };
    }
    return null;
  };

  const conflict = editingCell
    ? findConflict(editingCell.weekday, editingCell.period, editingCell.teacherId)
    : null;

  const updateSlotMutation = useMutation({
    mutationFn: (cell: EditingCell) => {
      if (!activeSchedule) throw new Error('No class selected');
      return adminService.updateTimetableSlot({
        className: activeSchedule.className,
        section: activeSchedule.section,
        weekday: cell.weekday,
        period: cell.period,
        subjectCode: cell.subjectCode,
        teacherId: cell.teacherId,
      });
    },
    onSuccess: () => {
      toast.success('Timetable slot updated!');
      queryClient.invalidateQueries({ queryKey: qk.admin.timetable() });
      setEditingCell(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const createEventMutation = useMutation({
    mutationFn: (payload: CreateCalendarEventBody) => adminService.createCalendarEvent(payload),
    onSuccess: () => {
      toast.success('Calendar event added!');
      queryClient.invalidateQueries({ queryKey: qk.admin.calendar() });
      setIsAddEventOpen(false);
      setEventFormData({ title: '', date: '2025-08-15', category: 'EVENT' });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCalendarEvent(id),
    onSuccess: () => {
      toast.success('Event removed');
      queryClient.invalidateQueries({ queryKey: qk.admin.calendar() });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Academic Timetable & Calendar
            </h1>
            <Badge variant="outline" className="text-xs">
              Weekly Master Grid
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Set weekly class period schedules and manage the school's holiday and exam calendar.
          </p>
        </div>

        <Button
          onClick={() => setIsAddEventOpen(true)}
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiPlus className="h-3.5 w-3.5" />
          <span>Add Calendar Event</span>
        </Button>
      </div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="h-10 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="timetable" className="rounded-md px-4 text-xs font-semibold">
            <PiClock className="mr-1.5 h-3.5 w-3.5" />
            <span>Class Timetable Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-md px-4 text-xs font-semibold">
            <PiCalendar className="mr-1.5 h-3.5 w-3.5" />
            <span>Academic Event Calendar</span>
          </TabsTrigger>
        </TabsList>

        {/* Timetable Matrix Tab */}
        <TabsContent value="timetable" className="pt-4 focus:outline-hidden">
          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="border-b border-slate-100 pb-3 dark:border-zinc-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base font-bold">
                    Class {selectedClass} Weekly Schedule
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Monday to Saturday period schedule with assigned subject teachers.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs font-semibold">Select Class:</span>
                  <select
                    value={activeClass ?? ''}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    disabled={classOptions.length === 0}
                    className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    {classOptions.length === 0 && <option value="">No classes yet</option>}
                    {classOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        Class {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>

            {timetableLoading ? (
              <div className="space-y-1.5 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : timetableErrored ? (
              <ErrorState
                description={getErrorMessage(timetableError)}
                onRetry={() => refetchTimetable()}
              />
            ) : !activeClass ? (
              <Empty className="rounded-md border-0 p-8">
                <EmptyMedia illustration="timetable" illustrationSize={120} />
                <EmptyTitle>No classes yet</EmptyTitle>
                <EmptyDescription>
                  Create a class section first, then build its timetable here.
                </EmptyDescription>
              </Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60">
                      <th className="w-24 p-3 font-bold text-slate-800 dark:text-zinc-200">
                        Period
                      </th>
                      {WEEKDAYS.map((day) => (
                        <th key={day} className="p-3 font-bold text-slate-800 dark:text-zinc-200">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {PERIODS.map((periodNumber) => (
                      <tr
                        key={periodNumber}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                      >
                        <td className="text-primary bg-slate-50/30 p-3 font-semibold dark:bg-zinc-900">
                          Period {periodNumber}
                        </td>
                        {WEEKDAYS.map((day) => {
                          const slot = slotAt(day, periodNumber);
                          return (
                            <td key={day} className="p-1.5 align-top">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingCell({
                                    weekday: day,
                                    period: periodNumber,
                                    subjectCode: slot?.subjectCode ?? '',
                                    teacherId: slot?.teacherId ?? '',
                                  })
                                }
                                className="group w-full rounded-md p-1.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800"
                              >
                                {slot ? (
                                  <div className="border-primary/20 bg-primary/5 dark:bg-primary/10 relative space-y-0.5 rounded-md border p-2">
                                    <PiPencilSimple className="text-primary/70 absolute top-1.5 right-1.5 h-2.5 w-2.5 opacity-0 group-hover:opacity-100" />
                                    <p className="text-primary leading-tight font-bold">
                                      {slot.subjectName}
                                    </p>
                                    <p className="text-muted-foreground font-mono text-[10px]">
                                      {slot.subjectCode}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-600 dark:text-zinc-400">
                                      {slot.teacherFullName}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground flex items-center gap-1 text-[10px]">
                                    <PiPlus className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100" />
                                    Free Period
                                  </span>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Academic Calendar Events Tab */}
        <TabsContent value="calendar" className="pt-4 focus:outline-hidden">
          {calendarLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-36 w-full" />
              ))}
            </div>
          ) : calendarErrored ? (
            <ErrorState
              description={getErrorMessage(calendarError)}
              onRetry={() => refetchCalendar()}
            />
          ) : (calendarEvents ?? []).length === 0 ? (
            <Empty className="rounded-md border p-8">
              <EmptyMedia illustration="calendar" illustrationSize={120} />
              <EmptyTitle>No calendar events yet</EmptyTitle>
              <EmptyDescription>Add the first holiday, exam, or event date.</EmptyDescription>
              <Button size="sm" className="mt-1 text-xs" onClick={() => setIsAddEventOpen(true)}>
                <PiPlus className="mr-1 h-3.5 w-3.5" />
                Add Calendar Event
              </Button>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(calendarEvents ?? []).map((ev, idx) => {
                const eventId = ev.id || `ev-${idx}`;
                return (
                  <Card
                    key={eventId}
                    className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold ${
                            ev.category === 'HOLIDAY'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : ev.category === 'EXAM'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {ev.category}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
                          <PiCalendar className="text-primary h-3 w-3" />
                          <span>{ev.date}</span>
                        </span>
                      </div>
                      <CardTitle className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex items-center justify-between pt-0">
                      <span className="text-muted-foreground text-xs">Session 2025-2026</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-rose-600 hover:bg-rose-50"
                        onClick={() => deleteEventMutation.mutate(eventId)}
                      >
                        <PiTrash className="h-3.5 w-3.5" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Calendar Event Modal */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiSparkle className="h-4 w-4" />
              <span>Event Scheduling</span>
            </div>
            <DialogTitle className="text-lg font-bold">Add Calendar Event</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              createEventMutation.mutate(eventFormData);
            }}
            className="space-y-4 pt-2"
          >
            <div className="space-y-1">
              <Label htmlFor="evTitle" className="text-xs font-semibold">
                Event Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="evTitle"
                placeholder="e.g. Science Exhibition & Fair"
                value={eventFormData.title}
                onChange={(e) => setEventFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="evDate" className="text-xs font-semibold">
                  Date <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="evDate"
                  type="date"
                  value={eventFormData.date}
                  onChange={(e) => setEventFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="evCat" className="text-xs font-semibold">
                  Category <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="evCat"
                  value={eventFormData.category}
                  onChange={(e) =>
                    setEventFormData((prev) => ({
                      ...prev,
                      category: e.target.value as CreateCalendarEventBody['category'],
                    }))
                  }
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="HOLIDAY">Holiday</option>
                  <option value="EXAM">Examination</option>
                  <option value="EVENT">School Event</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddEventOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEventMutation.isPending}
                className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
              >
                {createEventMutation.isPending ? 'Adding...' : 'Save Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Timetable Cell Editor */}
      <Dialog open={!!editingCell} onOpenChange={() => setEditingCell(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiClock className="h-4 w-4" />
              <span>Timetable Slot</span>
            </div>
            <DialogTitle className="text-base font-bold">
              {editingCell && `${editingCell.weekday} · Period ${editingCell.period}`}
            </DialogTitle>
          </DialogHeader>

          {editingCell && (
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Subject <span className="text-rose-500">*</span>
                </Label>
                <NativeSelect
                  value={editingCell.subjectCode}
                  onChange={(e) =>
                    setEditingCell((prev) =>
                      prev ? { ...prev, subjectCode: e.target.value } : prev,
                    )
                  }
                  className="h-9 text-xs"
                >
                  <NativeSelectOption value="" disabled>
                    Select…
                  </NativeSelectOption>
                  {subjectOptions.map((opt) => (
                    <NativeSelectOption key={opt.value} value={opt.value}>
                      {opt.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Teacher <span className="text-rose-500">*</span>
                </Label>
                <NativeSelect
                  value={editingCell.teacherId}
                  onChange={(e) =>
                    setEditingCell((prev) => (prev ? { ...prev, teacherId: e.target.value } : prev))
                  }
                  className="h-9 text-xs"
                >
                  <NativeSelectOption value="" disabled>
                    Select…
                  </NativeSelectOption>
                  {teacherOptions.map((opt) => (
                    <NativeSelectOption key={opt.value} value={opt.value}>
                      {opt.label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              {conflict && (
                <div className="flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300">
                  <PiWarning className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    {conflict.teacherName} is already teaching Class {conflict.className}-
                    {conflict.section} at this same time.
                  </span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingCell(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={
                !editingCell ||
                !editingCell.subjectCode ||
                !editingCell.teacherId ||
                updateSlotMutation.isPending
              }
              onClick={() => editingCell && updateSlotMutation.mutate(editingCell)}
              className="bg-primary hover:bg-primary/90 text-xs text-white"
            >
              {updateSlotMutation.isPending ? 'Saving...' : conflict ? 'Save Anyway' : 'Save Slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAcademic;
