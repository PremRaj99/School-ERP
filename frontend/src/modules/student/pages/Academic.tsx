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

export const StudentAcademic: React.FC = () => {
  const [session, setSession] = useState('');
  const [month, setMonth] = useState('');

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
            <div className="space-y-2">
              <Label htmlFor="session">Session</Label>
              <Input
                id="session"
                placeholder="e.g. 2025-2026"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="button" className="w-full">
              View Timetable
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Calendar</CardTitle>
            <CardDescription>
              View holidays, sports, cultural events, and exam periods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="month">Filter Month (MM-YYYY)</Label>
              <Input
                id="month"
                placeholder="e.g. 08-2026"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="button" variant="outline" className="w-full">
              View Calendar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StudentAcademic;
