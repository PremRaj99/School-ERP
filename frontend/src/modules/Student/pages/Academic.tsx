import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

const studentTimetable = [
  {
    period: 1,
    time: '08:30 - 09:15 AM',
    slots: {
      MON: 'Mathematics (Meenakshi S.)',
      TUE: 'Physics (Vikram C.)',
      WED: 'Mathematics (Meenakshi S.)',
      THU: 'Chemistry (Rajesh N.)',
      FRI: 'Physics (Vikram C.)',
      SAT: 'Computer Sci (Alok M.)',
    },
  },
  {
    period: 2,
    time: '09:15 - 10:00 AM',
    slots: {
      MON: 'English Lit (Anjali K.)',
      TUE: 'Mathematics (Meenakshi S.)',
      WED: 'English Lit (Anjali K.)',
      THU: 'Mathematics (Meenakshi S.)',
      FRI: 'Chemistry (Rajesh N.)',
      SAT: 'Library / Reading',
    },
  },
  {
    period: 3,
    time: '10:00 - 10:45 AM',
    slots: {
      MON: 'Physics Lab (Vikram C.)',
      TUE: 'Chemistry Lab (Rajesh N.)',
      WED: 'Biology (Staff)',
      THU: 'Physics (Vikram C.)',
      FRI: 'Mathematics (Meenakshi S.)',
      SAT: 'Physical Education (Coach)',
    },
  },
  {
    period: 4,
    time: '11:15 - 12:00 PM',
    slots: {
      MON: 'Chemistry (Rajesh N.)',
      TUE: 'English Lit (Anjali K.)',
      WED: 'Social Studies (Staff)',
      THU: 'Computer Lab (Alok M.)',
      FRI: 'English Lit (Anjali K.)',
      SAT: 'Value Education',
    },
  },
];

const studentEvents = [
  { title: 'Summer Vacation Begins', date: '15-05-2025', category: 'HOLIDAY' },
  { title: 'Mid-Term Examination Week', date: '15-10-2025', category: 'EXAM' },
  { title: 'Annual Inter-House Sports Meet', date: '20-11-2025', category: 'EVENT' },
  { title: 'Republic Day Celebration', date: '26-01-2026', category: 'HOLIDAY' },
];

export const StudentAcademic: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Academic Timetable & Events</h1>
            <Badge variant="outline" className="border-indigo-500/30 text-xs text-indigo-600">
              Class 10-A
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Weekly class schedule matrix, period timings, and school event holiday calendar.
          </p>
        </div>
      </div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="h-10 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="timetable" className="rounded-lg px-4 text-xs font-semibold">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
            <span>Weekly Class Timetable</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg px-4 text-xs font-semibold">
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            <span>School Event Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timetable" className="pt-4 focus:outline-hidden">
          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
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
                  {studentTimetable.map((row) => (
                    <tr key={row.period} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="bg-slate-50/30 p-3 font-semibold text-indigo-600 dark:bg-zinc-900 dark:text-indigo-400">
                        <div>Period {row.period}</div>
                        <span className="text-muted-foreground text-[10px] font-normal">
                          {row.time}
                        </span>
                      </td>
                      {(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const).map((day) => (
                        <td key={day} className="p-2.5 align-top">
                          <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-2 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                            <span className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200">
                              {row.slots[day]}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="pt-4 focus:outline-hidden">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {studentEvents.map((ev, idx) => (
              <Card
                key={idx}
                className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-semibold ${
                        ev.category === 'HOLIDAY'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
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
                <CardContent className="text-muted-foreground text-xs">
                  Session 2025-2026 Academic Event
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentAcademic;
