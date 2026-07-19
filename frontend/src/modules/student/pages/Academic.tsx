import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Loader2, CalendarRange } from 'lucide-react';

interface AcademicEventItem { id: string; title: string; date: string; category: string; description?: string; }


export default function Academic() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['student', 'events'],
    queryFn: studentService.getAcademicEvents,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Academic Calendar</h2>
        <p className="text-muted-foreground">
          View holidays, examination periods, and planned assemblies.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2">
          <CalendarRange className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle>Academic Milestones</CardTitle>
            <CardDescription>Listing of scheduled calendar events.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !events || events.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No events marked on the academic calendar.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Event Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev: AcademicEventItem) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-semibold whitespace-nowrap">
                        {ev.date?.split('T')[0]}
                      </TableCell>
                      <TableCell className="font-medium">{ev.title}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            ev.category === 'HOLIDAY'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                              : ev.category === 'EXAM'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          }`}
                        >
                          {ev.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {ev.description || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
