import { useQuery } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Users, GraduationCap, ClipboardList, BookOpen, Bell, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { data: classes } = useQuery({
    queryKey: ['admin', 'classes'],
    queryFn: adminService.getClasses,
  });
  const { data: subjects } = useQuery({
    queryKey: ['admin', 'subjects'],
    queryFn: adminService.getSubjects,
  });
  const { data: teachers } = useQuery({
    queryKey: ['admin', 'teachers'],
    queryFn: adminService.getTeachers,
  });
  const { data: students } = useQuery({
    queryKey: ['admin', 'students'],
    queryFn: adminService.getStudents,
  });
  const { data: notices } = useQuery({
    queryKey: ['admin', 'notices'],
    queryFn: adminService.getNotices,
  });
  const { data: events } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: adminService.getAcademicEvents,
  });

  const stats = [
    {
      name: 'Total Students',
      value: students?.length ?? 0,
      icon: GraduationCap,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      name: 'Total Teachers',
      value: teachers?.length ?? 0,
      icon: Users,
      color: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    },
    {
      name: 'Active Classes',
      value: classes?.length ?? 0,
      icon: ClipboardList,
      color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    },
    {
      name: 'Subjects Offered',
      value: subjects?.length ?? 0,
      icon: BookOpen,
      color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/30',
    },
    {
      name: 'Notice Board Messages',
      value: notices?.length ?? 0,
      icon: Bell,
      color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30',
    },
    {
      name: 'Academic Events',
      value: events?.length ?? 0,
      icon: Calendar,
      color: 'text-teal-600 bg-teal-100 dark:bg-teal-900/30',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview Dashboard</h2>
        <p className="text-muted-foreground">
          Quick statistics and details of the current academic session.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {stat.name}
                </CardTitle>
                <div className={`rounded-md p-2 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
