import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, Search, Pin } from 'lucide-react';

const studentNotices = [
  {
    title: 'Quarterly Examination Date Sheet Declared',
    desc: 'The official date sheet for Mid-Term Assessment 2025-2026 has been published. All students are advised to check venue schedules.',
    date: '10-04-2025',
    target: 'Student',
    isPinned: true,
  },
  {
    title: 'Annual Sports & Athletics Meet 2026',
    desc: 'Inter-house selection trials for sprints, relay, long jump, and track events will commence next Monday at the sports stadium.',
    date: '08-04-2025',
    target: 'All',
    isPinned: true,
  },
  {
    title: 'Library Book Return & Renewal Notice',
    desc: 'All issued library reference books must be renewed or returned before the upcoming examination week to avoid late fines.',
    date: '03-04-2025',
    target: 'Student',
    isPinned: false,
  },
];

export const StudentNotices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = studentNotices.filter((n) =>
    `${n.title} ${n.desc}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Student Notice Board & Circulars
            </h1>
            <Badge variant="outline" className="border-indigo-500/30 text-xs text-indigo-600">
              Campus Announcements
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Official announcements, examination notifications, and holiday circulars.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search student circulars..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notices Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((notice, idx) => (
          <Card
            key={idx}
            className="border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className="bg-sky-50 text-[10px] font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300"
                  >
                    Target: {notice.target}
                  </Badge>
                  {notice.isPinned && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/30 text-[10px] text-amber-600"
                    >
                      <Pin className="mr-1 h-2.5 w-2.5" />
                      Pinned
                    </Badge>
                  )}
                </div>
                <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Calendar className="h-3 w-3 text-indigo-500" />
                  <span>{notice.date}</span>
                </span>
              </div>
              <CardTitle className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {notice.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-xs leading-relaxed">
              {notice.desc}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentNotices;
