import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { User, Phone, Calendar, School, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['student', 'profile'],
    queryFn: studentService.getProfile,
  });

  const { data: subjects } = useQuery({
    queryKey: ['student', 'subjects'],
    queryFn: studentService.getSubjects,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Student Dashboard</h2>
        <p className="text-muted-foreground">
          Access your academic records, schedules, and fee receipts.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
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
                <img
                  src={profile?.profilePhoto}
                  alt="Student Profile"
                  className="h-16 w-16 rounded-full border object-cover"
                />
                <div>
                  <h3 className="text-lg font-bold">
                    {profile?.firstName} {profile?.lastName || ''}
                  </h3>
                  <p className="text-muted-foreground text-sm">Enrolled Student</p>
                </div>
              </div>

              <div className="grid gap-3 border-t pt-4 text-sm md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <School className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Class:</span>
                  <span>
                    {profile?.class?.className} - {profile?.class?.section}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Roll No:</span>
                  <span>{profile?.rollNo}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Date of Admission:</span>
                  <span>{profile?.dateOfAdmission?.split('T')[0]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Emergency Contact:</span>
                  <span>{profile?.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  My Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-2xl font-bold">{subjects?.length ?? 0}</div>
                <BookOpen className="h-8 w-8 rounded-md bg-blue-100 p-1.5 text-blue-600 dark:bg-blue-900/30" />
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Current Session
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-lg font-bold">{profile?.class?.session || '2025-2026'}</div>
                <Calendar className="h-8 w-8 rounded-md bg-cyan-100 p-1.5 text-cyan-600 dark:bg-cyan-900/30" />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
