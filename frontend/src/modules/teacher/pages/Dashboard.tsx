import { useQuery } from '@tanstack/react-query';
import { teacherService } from '../services/teacherService';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { User, Mail, Phone, DollarSign, Calendar, Bell } from 'lucide-react';

export default function Dashboard() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['teacher', 'profile'],
    queryFn: teacherService.getProfile,
  });

  const { data: notices } = useQuery({
    queryKey: ['teacher', 'notices'],
    queryFn: teacherService.getNotices,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h2>
        <p className="text-muted-foreground">Manage class registries and grading reports.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-border shadow-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-2xl font-bold text-violet-700 uppercase dark:bg-violet-900/30 dark:text-violet-400">
                  {profile?.firstName?.slice(0, 1)}
                  {profile?.lastName?.slice(0, 1)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {profile?.firstName} {profile?.lastName}
                  </h3>
                  <p className="text-muted-foreground text-sm">Faculty Member</p>
                </div>
              </div>

              <div className="grid gap-3 border-t pt-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Username:</span>
                  <span>{profile?.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Email:</span>
                  <span>{profile?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Phone:</span>
                  <span>{profile?.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Salary:</span>
                  <span>${profile?.salary} / month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Active Notices
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-2xl font-bold">{notices?.length ?? 0}</div>
                <Bell className="h-8 w-8 rounded-md bg-violet-100 p-1.5 text-violet-600 dark:bg-violet-900/30" />
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Active Session
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-lg font-bold">2025-2026</div>
                <Calendar className="h-8 w-8 rounded-md bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-900/30" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
