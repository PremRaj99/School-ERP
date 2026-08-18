import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { adminService } from '@/lib/services/admin.service';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const AdminAcademic: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [timetableData, setTimetableData] = useState({
    className: '',
    section: '',
    weekday: 'MON',
    period: '1',
    subjectCode: '',
    teacherId: '',
  });

  const [calendarData, setCalendarData] = useState({
    title: '',
    date: '',
    category: 'HOLIDAY',
  });

  const [calendarIdToDelete, setCalendarIdToDelete] = useState('');

  const handleTimetableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimetableData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCalendarData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveTimetable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        className: timetableData.className,
        section: timetableData.section,
        weekday: timetableData.weekday,
        period: Number(timetableData.period),
      };
      if (timetableData.subjectCode) payload.subjectCode = timetableData.subjectCode;
      if (timetableData.teacherId) payload.teacherId = timetableData.teacherId;

      const res = await adminService.updateTimetableSlot(payload);
      toast.success(res.message || 'Timetable slot updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await adminService.getTimetable();
      toast.success(res.message || 'Full timetable grid fetched');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleAddCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminService.createCalendarEvent(calendarData);
      toast.success(res.message || 'Calendar event created successfully!');
      setCalendarData({ title: '', date: '', category: 'HOLIDAY' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCalendar = async () => {
    if (!calendarIdToDelete) {
      toast.error('Enter Calendar Entry ID to delete');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.deleteCalendarEvent(calendarIdToDelete);
      toast.success(res.message || 'Calendar event deleted successfully!');
      setCalendarIdToDelete('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Management</h1>
        <p className="text-muted-foreground text-xs">
          Manage timetable slots and academic calendar events.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timetable Slot Configuration</CardTitle>
            <CardDescription>Assign teacher and subject to class period slots.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveTimetable}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Class</Label>
                  <Input
                    id="className"
                    name="className"
                    placeholder="e.g. 10"
                    value={timetableData.className}
                    onChange={handleTimetableChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    name="section"
                    placeholder="e.g. A"
                    value={timetableData.section}
                    onChange={handleTimetableChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weekday">Weekday</Label>
                  <Input
                    id="weekday"
                    name="weekday"
                    placeholder="MON, TUE, WED, THU, FRI, SAT"
                    value={timetableData.weekday}
                    onChange={handleTimetableChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period">Period (1–8)</Label>
                  <Input
                    id="period"
                    name="period"
                    type="number"
                    placeholder="e.g. 1"
                    value={timetableData.period}
                    onChange={handleTimetableChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectCode">Subject Code (opt)</Label>
                  <Input
                    id="subjectCode"
                    name="subjectCode"
                    placeholder="e.g. MATH10"
                    value={timetableData.subjectCode}
                    onChange={handleTimetableChange}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacherId">Teacher ID (opt)</Label>
                  <Input
                    id="teacherId"
                    name="teacherId"
                    placeholder="e.g. TCH12345678"
                    value={timetableData.teacherId}
                    onChange={handleTimetableChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Timetable Slot'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleFetchTimetable}
                disabled={loading}
              >
                Fetch Full Grid
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Calendar Event</CardTitle>
              <CardDescription>Create holidays, exam schedules, and events.</CardDescription>
            </CardHeader>
            <form onSubmit={handleAddCalendar}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g. Independence Day Holiday"
                    value={calendarData.title}
                    onChange={handleCalendarChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date (DD-MM-YYYY)</Label>
                    <Input
                      id="date"
                      name="date"
                      placeholder="DD-MM-YYYY"
                      value={calendarData.date}
                      onChange={handleCalendarChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      placeholder="HOLIDAY | EVENT | EXAM | OTHER"
                      value={calendarData.category}
                      onChange={handleCalendarChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Calendar Entry'}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delete Calendar Entry</CardTitle>
              <CardDescription>Remove an event by its ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calendarId">Calendar Entry ID</Label>
                <Input
                  id="calendarId"
                  placeholder="24-character ObjectId"
                  value={calendarIdToDelete}
                  onChange={(e) => setCalendarIdToDelete(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                onClick={handleDeleteCalendar}
                disabled={loading}
                variant="destructive"
                className="w-full"
              >
                Delete Event
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAcademic;
