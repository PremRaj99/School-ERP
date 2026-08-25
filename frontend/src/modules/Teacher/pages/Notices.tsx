import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ErrorState } from '@/components/data-table';
import { teacherService } from '@/lib/services/teacher.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate, dateToIsoDate } from '@/lib/date';
import { PiCalendar, PiMagnifyingGlass, PiBell, PiFileText } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

const isExpired = (expiryDate: string | null) =>
  !!expiryDate && expiryDate < dateToIsoDate(new Date());

export const TeacherNotices: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);

  const {
    data: notices,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.teacher.notices(),
    queryFn: () => teacherService.getNotices(),
  });

  const { data: noticeDetail, isLoading: detailLoading } = useQuery({
    queryKey: qk.teacher.notice(selectedNoticeId ?? ''),
    queryFn: () => teacherService.getNoticeById(selectedNoticeId as string),
    enabled: !!selectedNoticeId,
  });

  const filteredNotices = (notices ?? []).filter((n) =>
    n.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Faculty Circulars & Directives
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              Staff Notice Board
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Official administrative announcements and academic directives for teaching faculty.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <PiMagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
        <Input
          placeholder="Search faculty circulars..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 pl-9 text-xs"
        />
      </div>

      {/* Notices Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredNotices.length === 0 ? (
        <Empty className="rounded-md border p-8">
          <EmptyMedia illustration="notices" illustrationSize={120} />
          <EmptyTitle>No notices yet</EmptyTitle>
          <EmptyDescription>
            {searchTerm ? 'No notices match your search.' : 'Announcements will show up here.'}
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredNotices.map((notice) => {
            const expired = isExpired(notice.expiryDate);
            return (
              <Card
                key={notice.id}
                onClick={() => setSelectedNoticeId(notice.id)}
                className="cursor-pointer border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="bg-muted text-muted-foreground text-[10px] font-semibold"
                      >
                        Target: {notice.targetRole}
                      </Badge>
                      {expired && (
                        <Badge
                          variant="outline"
                          className="border-slate-300 text-[10px] text-slate-500"
                        >
                          Expired
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                      <PiCalendar className="text-primary h-3 w-3" />
                      <span>{isoToDisplayDate(notice.date)}</span>
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {notice.title}
                  </CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={!!selectedNoticeId} onOpenChange={() => setSelectedNoticeId(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-lg lg:max-w-xl">
          <div className="space-y-4 p-6">
            {detailLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : noticeDetail ? (
              <>
                <SheetHeader>
                  <div className="text-primary flex items-center gap-2 text-xs font-semibold">
                    <PiBell className="h-4 w-4" />
                    <span>Notice</span>
                  </div>
                  <SheetTitle className="text-lg font-bold">{noticeDetail.title}</SheetTitle>
                  <SheetDescription className="text-xs">
                    Published {isoToDisplayDate(noticeDetail.date)} · Target:{' '}
                    {noticeDetail.targetRole}
                    {noticeDetail.expiryDate &&
                      ` · Expires ${isoToDisplayDate(noticeDetail.expiryDate)}`}
                  </SheetDescription>
                </SheetHeader>
                <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
                  {noticeDetail.description}
                </p>
                {noticeDetail.fileUrl && (
                  <a
                    href={noticeDetail.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary flex items-center gap-1.5 text-xs font-semibold hover:underline"
                  >
                    <PiFileText className="h-3.5 w-3.5" />
                    View attached document
                  </a>
                )}
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default TeacherNotices;
