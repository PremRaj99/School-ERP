import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { studentService } from '@/lib/services/student.service';
import type { TimeTableSlot, CalendarEvent } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const StudentAcademic: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timetable, setTimetable] = useState<TimeTableSlot[] | null>(null);
  const [calendar, setCalendar] = useState<CalendarEvent[] | null>(null);

  const handleFetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await studentService.getTimetable();
      setTimetable(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Timetable retrieved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await studentService.getCalendar();
      setCalendar(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Academic calendar retrieved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Schedule & Calendar</h1>
        <p className="text-muted-foreground text-xs">
          View weekly class timetable and school academic calendar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Timetable</CardTitle>
            <CardDescription>View your daily period schedule and assigned teachers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleFetchTimetable} disabled={loading} className="w-full">
              {loading ? 'Fetching...' : 'Load Class Timetable'}
            </Button>
            {timetable && (
              <div className="max-h-56 space-y-2 overflow-y-auto pt-2">
                {timetable.length > 0 ? (
                  timetable.map((slot, i) => (
                    <div key={i} className="flex justify-between rounded border p-2 text-xs">
                      <span>
                        <strong>{slot.weekday}</strong> (Period {slot.period})
                      </span>
                      <span>
                        {slot.subjectCode || 'Free'} — {slot.teacherId || 'TBA'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">No timetable slots configured.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Calendar</CardTitle>
            <CardDescription>
              View holidays, sports, cultural events, and exam periods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleFetchCalendar}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Fetching...' : 'Load Academic Calendar'}
            </Button>
            {calendar && (
              <div className="max-h-56 space-y-2 overflow-y-auto pt-2">
                {calendar.length > 0 ? (
                  calendar.map((event, i) => (
                    <div key={i} className="flex justify-between rounded border p-2 text-xs">
                      <div>
                        <p className="font-semibold">{event.title}</p>
                        <p className="text-muted-foreground">{event.date}</p>
                      </div>
                      <span className="bg-muted self-center rounded px-2 py-0.5 font-mono text-xs">
                        {event.category}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">No calendar events found.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentAcademic;
