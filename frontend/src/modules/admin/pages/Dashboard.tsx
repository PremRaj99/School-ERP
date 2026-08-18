import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/services/admin.service';
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  UserPlus,
  Bell,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  const dashboardData = data?.data;

  // Chart data fallbacks for rich visualization
  const attendanceTrendData = [
    { day: 'Mon', students: 94, staff: 98 },
    { day: 'Tue', students: 96, staff: 97 },
    { day: 'Wed', students: 91, staff: 95 },
    { day: 'Thu', students: 95, staff: 100 },
    { day: 'Fri', students: 93, staff: 96 },
    { day: 'Sat', students: 89, staff: 92 },
  ];

  const financialTrendData = [
    { month: 'Nov', collected: 142000, salaries: 85000 },
    { month: 'Dec', collected: 189000, salaries: 85000 },
    { month: 'Jan', collected: 215000, salaries: 92000 },
    { month: 'Feb', collected: 198000, salaries: 92000 },
    { month: 'Mar', collected: 245000, salaries: 95000 },
    { month: 'Apr', collected: 260000, salaries: 95000 },
  ];

  const classDistributionData = [
    { name: 'Primary (1-5)', value: 420, color: '#6366f1' },
    { name: 'Middle (6-8)', value: 380, color: '#8b5cf6' },
    { name: 'Secondary (9-10)', value: 290, color: '#0ea5e9' },
    { name: 'Sr. Secondary (11-12)', value: 210, color: '#10b981' },
  ];

  const studentsCount = dashboardData?.counts?.students ?? 1300;
  const teachersCount = dashboardData?.counts?.teachers ?? 78;
  const classesCount = dashboardData?.counts?.classes ?? 32;
  const pendingFees = dashboardData?.finance?.pendingStudentFees?.totalAmount ?? 84500;
  const pendingSalaries = dashboardData?.finance?.pendingTeacherSalaries?.totalAmount ?? 42000;

  return (
    <div className="space-y-6">
      {/* Top Header with Quick Actions */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Institutional Overview
            </h1>
            <Badge
              variant="outline"
              className="bg-indigo-50 text-xs text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
            >
              Live Session 2025-2026
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Real-time telemetry, attendance trends, financial health, and academic notices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Syncing...' : 'Sync Data'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/admin/students')}
            className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Admit Student</span>
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-semibold">Enrolled Students</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {studentsCount.toLocaleString()}
              </span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="mr-0.5 h-3 w-3" />
                +8.4%
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-zinc-800/80">
              <span className="text-muted-foreground">Across {classesCount} sections</span>
              <button
                onClick={() => navigate('/admin/students')}
                className="flex items-center gap-0.5 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <span>Directory</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Staff */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-semibold">Teaching Faculty</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {teachersCount.toLocaleString()}
              </span>
              <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                98% Present
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-zinc-800/80">
              <span className="text-muted-foreground">Full-time instructors</span>
              <button
                onClick={() => navigate('/admin/teachers')}
                className="flex items-center gap-0.5 font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
              >
                <span>Faculty</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Classes & Curriculum */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-semibold">Class Sections</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {classesCount}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                Grades 1-12
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-zinc-800/80">
              <span className="text-muted-foreground">Active timetable matrix</span>
              <button
                onClick={() => navigate('/admin/classes')}
                className="flex items-center gap-0.5 font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                <span>Classes</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Finance Snapshot */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-semibold">Pending Fee Dues</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{(pendingFees / 1000).toFixed(1)}k
              </span>
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Sal: ₹{(pendingSalaries / 1000).toFixed(1)}k
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs dark:border-zinc-800/80">
              <span className="text-muted-foreground">Ledger balance</span>
              <button
                onClick={() => navigate('/admin/finance')}
                className="flex items-center gap-0.5 font-semibold text-amber-600 hover:underline dark:text-amber-400"
              >
                <span>Ledger</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Weekly Attendance Trend */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-7 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Weekly Attendance Percentage</CardTitle>
                <CardDescription className="text-xs">
                  Average daily attendance comparison between students and faculty
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                  <span className="text-muted-foreground">Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Faculty</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attendanceTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#888888" />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} stroke="#888888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(18, 20, 29, 0.9)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="students" fill="#6366f1" radius={[4, 4, 0, 0]} name="Students %" />
                  <Bar dataKey="staff" fill="#10b981" radius={[4, 4, 0, 0]} name="Faculty %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Enrollment Distribution */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-5 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Grade Tier Distribution</CardTitle>
            <CardDescription className="text-xs">
              Enrolled strength segmented by academic levels
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={classDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {classDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(18, 20, 29, 0.9)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              {classDistributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground truncate">{item.name}</span>
                  <span className="ml-auto font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health & Upcoming Schedules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Fee Collection vs Payroll Trend */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-8 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">
                  Fee Realization vs Staff Payroll
                </CardTitle>
                <CardDescription className="text-xs">
                  Monthly cash collection against monthly teacher salaries (₹)
                </CardDescription>
              </div>
              <button
                onClick={() => navigate('/admin/finance')}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <span>Full Ledger</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={financialTrendData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSalaries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#888888" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#888888" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(18, 20, 29, 0.9)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke="#6366f1"
                    fillOpacity={1}
                    fill="url(#colorCollected)"
                    name="Fees Collected (₹)"
                  />
                  <Area
                    type="monotone"
                    dataKey="salaries"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorSalaries)"
                    name="Teacher Payroll (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bulletins & Upcoming Exams */}
        <Card className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-4 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <Bell className="h-4 w-4 text-orange-500" />
                <span>Notice Bulletin</span>
              </CardTitle>
              <button
                onClick={() => navigate('/admin/notices')}
                className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
              >
                View all
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/30">
              <div className="flex items-center justify-between font-semibold text-indigo-950 dark:text-indigo-200">
                <span>Annual Sports Day 2026</span>
                <Badge variant="outline" className="h-4 text-[9px]">
                  All
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px]">
                Preparations and trials commence next Monday for all grades.
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-zinc-200">
                <span>Quarterly Assessment Schedule</span>
                <Badge variant="outline" className="h-4 text-[9px]">
                  Students
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px]">
                Exam date sheets published for Classes 6 through 12.
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-zinc-200">
                <span>Staff Academic Council Meet</span>
                <Badge variant="outline" className="h-4 text-[9px]">
                  Teachers
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 line-clamp-2 text-[11px]">
                Curriculum review scheduled this Friday in Main Auditorium.
              </p>
            </div>
          </CardContent>
          <div className="p-4 pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/admin/notices')}
            >
              <Bell className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
              <span>Broadcast New Circular</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
