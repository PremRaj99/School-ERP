import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

const sampleClassAttendance = [
  {
    className: '10',
    section: 'A',
    total: 42,
    present: 40,
    absent: 2,
    leave: 0,
    markedBy: 'Meenakshi S.',
  },
  {
    className: '10',
    section: 'B',
    total: 40,
    present: 38,
    absent: 1,
    leave: 1,
    markedBy: 'Vikram C.',
  },
  {
    className: '9',
    section: 'A',
    total: 38,
    present: 36,
    absent: 2,
    leave: 0,
    markedBy: 'Anjali K.',
  },
  {
    className: '9',
    section: 'B',
    total: 39,
    present: 38,
    absent: 0,
    leave: 1,
    markedBy: 'Rajesh N.',
  },
  { className: '8', section: 'A', total: 35, present: 34, absent: 1, leave: 0, markedBy: 'Staff' },
  {
    className: '11',
    section: 'A',
    total: 44,
    present: 41,
    absent: 2,
    leave: 1,
    markedBy: 'Meenakshi S.',
  },
  {
    className: '12',
    section: 'A',
    total: 45,
    present: 44,
    absent: 1,
    leave: 0,
    markedBy: 'Vikram C.',
  },
];

export const AdminAttendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('18-08-2026');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Institutional Attendance Central
            </h1>
            <Badge variant="outline" className="text-xs">
              Daily Aggregation
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Monitor daily section-wise student attendance registers and faculty check-ins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 w-36 text-xs font-semibold"
            placeholder="DD-MM-YYYY"
          />
          <Button
            size="sm"
            onClick={() => toast.success(`Synced records for ${selectedDate}`)}
            className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
          >
            <span>Sync Records</span>
          </Button>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">
              Total Enrolled Strength
            </span>
            <p className="mt-1 text-2xl font-bold">283 Students</p>
            <span className="text-muted-foreground text-[11px]">7 Active sections</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Present Today</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              271 (95.8%)
            </p>
            <span className="text-[11px] text-emerald-600">Optimal attendance</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Absent Unexcused</span>
            <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">9 Students</p>
            <span className="text-muted-foreground text-[11px]">SMS alerts dispatched</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Approved Leave</span>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">3 Students</p>
            <span className="text-muted-foreground text-[11px]">Medical / Leave slips</span>
          </CardContent>
        </Card>
      </div>

      {/* Class Wise Roster Status Table */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold">
            Section-Wise Attendance Logs ({selectedDate})
          </CardTitle>
          <CardDescription className="text-xs">
            Class teacher submissions for morning roll calls.
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
              <TableHead className="text-xs font-bold">Class & Sec</TableHead>
              <TableHead className="text-xs font-bold">Total Strength</TableHead>
              <TableHead className="text-xs font-bold">Present</TableHead>
              <TableHead className="text-xs font-bold">Absent</TableHead>
              <TableHead className="text-xs font-bold">Leave</TableHead>
              <TableHead className="text-xs font-bold">Rate %</TableHead>
              <TableHead className="text-right text-xs font-bold">Recorded By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleClassAttendance.map((row, idx) => {
              const rate = ((row.present / row.total) * 100).toFixed(1);
              return (
                <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                  <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                    Class {row.className}-{row.section}
                  </TableCell>
                  <TableCell className="text-xs">{row.total}</TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {row.present}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {row.absent}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {row.leave}
                  </TableCell>
                  <TableCell className="text-xs">
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {rate}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right text-xs">
                    {row.markedBy}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default AdminAttendance;
