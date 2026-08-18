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
import { adminService } from '@/lib/services/admin.service';
import type { CalendarEvent, CreateCalendarEventPayload } from '@/lib/types';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const sampleCalendarEvents: CalendarEvent[] = [
  { id: 'ev-1', title: 'Summer Vacation Break', date: '15-05-2025', category: 'HOLIDAY' },
  { id: 'ev-2', title: 'Mid-Term Assessment Week', date: '15-10-2025', category: 'EXAM' },
  { id: 'ev-3', title: 'Annual Sports Day 2026', date: '20-11-2025', category: 'EVENT' },
  { id: 'ev-4', title: 'Republic Day Celebration', date: '26-01-2026', category: 'HOLIDAY' },
  { id: 'ev-5', title: 'Final Term Exams Begin', date: '01-03-2026', category: 'EXAM' },
];

const timetableMatrix = [
  {
    period: 1,
    time: '08:30 - 09:15 AM',
    slots: {
      MON: { sub: 'Mathematics', code: 'MATH101', teacher: 'Meenakshi S.' },
      TUE: { sub: 'Physics', code: 'PHY201', teacher: 'Vikram C.' },
      WED: { sub: 'Mathematics', code: 'MATH101', teacher: 'Meenakshi S.' },
      THU: { sub: 'Chemistry', code: 'CHEM301', teacher: 'Rajesh N.' },
      FRI: { sub: 'Physics', code: 'PHY201', teacher: 'Vikram C.' },
      SAT: { sub: 'Computer Sci', code: 'CS501', teacher: 'Alok M.' },
    },
  },
  {
    period: 2,
    time: '09:15 - 10:00 AM',
    slots: {
      MON: { sub: 'English Lit', code: 'ENG001', teacher: 'Anjali K.' },
      TUE: { sub: 'Mathematics', code: 'MATH101', teacher: 'Meenakshi S.' },
      WED: { sub: 'English Lit', code: 'ENG001', teacher: 'Anjali K.' },
      THU: { sub: 'Mathematics', code: 'MATH101', teacher: 'Meenakshi S.' },
      FRI: { sub: 'Chemistry', code: 'CHEM301', teacher: 'Rajesh N.' },
      SAT: { sub: 'Library / PE', code: 'ACT001', teacher: 'Staff' },
    },
  },
  {
    period: 3,
    time: '10:00 - 10:45 AM',
    slots: {
      MON: { sub: 'Physics Lab', code: 'PHY201', teacher: 'Vikram C.' },
      TUE: { sub: 'Chemistry Lab', code: 'CHEM301', teacher: 'Rajesh N.' },
      WED: { sub: 'Biology', code: 'BIO401', teacher: 'Staff' },
      THU: { sub: 'Physics', code: 'PHY201', teacher: 'Vikram C.' },
      FRI: { sub: 'Mathematics', code: 'MATH101', teacher: 'Meenakshi S.' },
      SAT: { sub: 'Sports & Games', code: 'PE001', teacher: 'Coach' },
    },
  },
  {
    period: 4,
    time: '11:15 - 12:00 PM',
    slots: {
      MON: { sub: 'Chemistry', code: 'CHEM301', teacher: 'Rajesh N.' },
      TUE: { sub: 'English Lit', code: 'ENG001', teacher: 'Anjali K.' },
      WED: { sub: 'History / Civics', code: 'HIST102', teacher: 'Staff' },
      THU: { sub: 'Computer Lab', code: 'CS501', teacher: 'Alok M.' },
      FRI: { sub: 'English Lit', code: 'ENG001', teacher: 'Anjali K.' },
      SAT: { sub: 'Moral Science', code: 'VAL001', teacher: 'Staff' },
    },
  },
];

export const AdminAcademic: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState('10-A');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const [eventFormData, setEventFormData] = useState<CreateCalendarEventPayload>({
    title: '',
    date: '15-08-2025',
    category: 'HOLIDAY',
  });

  const { data: apiCalendar } = useQuery({
    queryKey: ['adminCalendar'],
    queryFn: () => adminService.getCalendar(),
  });

  const calendarEvents =
    apiCalendar?.data && Array.isArray(apiCalendar.data) && apiCalendar.data.length > 0
      ? apiCalendar.data
      : sampleCalendarEvents;

  const createEventMutation = useMutation({
    mutationFn: (payload: CreateCalendarEventPayload) => adminService.createCalendarEvent(payload),
    onSuccess: () => {
      toast.success('Calendar event added!');
      queryClient.invalidateQueries({ queryKey: ['adminCalendar'] });
      setIsAddEventOpen(false);
      setEventFormData({ title: '', date: '', category: 'EVENT' });
    },
    onError: () => toast.error('Failed to add event'),
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCalendarEvent(id),
    onSuccess: () => {
      toast.success('Event removed');
      queryClient.invalidateQueries({ queryKey: ['adminCalendar'] });
    },
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
            Configure weekly classroom period schedules and official institutional holiday/exam
            calendars.
          </p>
        </div>

        <Button
          onClick={() => setIsAddEventOpen(true)}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Calendar Event</span>
        </Button>
      </div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="h-10 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="timetable" className="rounded-lg px-4 text-xs font-semibold">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
            <span>Class Timetable Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg px-4 text-xs font-semibold">
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
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
                    Monday to Saturday period distribution and assigned faculty instructors.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs font-semibold">Select Class:</span>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="10-A">Class 10-A</option>
                    <option value="10-B">Class 10-B</option>
                    <option value="9-A">Class 9-A</option>
                    <option value="11-A">Class 11-A</option>
                    <option value="12-A">Class 12-A</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60">
                    <th className="w-32 p-3 font-bold text-slate-800 dark:text-zinc-200">
                      Period & Time
                    </th>
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                      <th key={day} className="p-3 font-bold text-slate-800 dark:text-zinc-200">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {timetableMatrix.map((row) => (
                    <tr key={row.period} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="bg-slate-50/30 p-3 font-semibold text-indigo-600 dark:bg-zinc-900 dark:text-indigo-400">
                        <div>Period {row.period}</div>
                        <span className="text-muted-foreground text-[10px] font-normal">
                          {row.time}
                        </span>
                      </td>
                      {(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const).map((day) => {
                        const slot = row.slots[day];
                        return (
                          <td key={day} className="p-2.5 align-top">
                            {slot ? (
                              <div className="space-y-0.5 rounded-lg border border-indigo-100 bg-indigo-50/60 p-2 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                                <p className="leading-tight font-bold text-indigo-950 dark:text-indigo-200">
                                  {slot.sub}
                                </p>
                                <p className="text-muted-foreground font-mono text-[10px]">
                                  {slot.code}
                                </p>
                                <p className="text-[10px] font-medium text-slate-600 dark:text-zinc-400">
                                  {slot.teacher}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">Free Period</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Academic Calendar Events Tab */}
        <TabsContent value="calendar" className="pt-4 focus:outline-hidden">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {calendarEvents.map((ev, idx) => {
              const eventId = ev.id || ev._id || `ev-${idx}`;
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
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}
                      >
                        {ev.category}
                      </Badge>
                      <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
                        <CalendarIcon className="h-3 w-3 text-indigo-500" />
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
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Calendar Event Modal */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
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
                  Date (DD-MM-YYYY) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="evDate"
                  placeholder="20-11-2025"
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
                    setEventFormData((prev) => ({ ...prev, category: e.target.value }))
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
                className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
              >
                {createEventMutation.isPending ? 'Adding...' : 'Save Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAcademic;
