import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Loader2, Bell } from 'lucide-react';

interface NoticeItem {
  id: string;
  title: string;
  date: string;
  description?: string;
}

export default function Notices() {
  const { data: notices, isLoading } = useQuery({
    queryKey: ['student', 'notices'],
    queryFn: studentService.getNotices,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notice Board</h2>
        <p className="text-muted-foreground">
          General announcements and updates published by school administrators.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      ) : !notices || notices.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">No active notices listed.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {notices.map((notice: NoticeItem) => (
            <Card key={notice.id} className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="mb-1 flex items-center gap-2 text-blue-600">
                  <Bell className="h-4 w-4" />
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    Announcement
                  </span>
                </div>
                <CardTitle className="text-lg font-bold">{notice.title}</CardTitle>
                <CardDescription>{notice.date?.split('T')[0]}</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                <p className="whitespace-pre-wrap">
                  {notice.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
