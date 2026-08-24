import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BarChart3, LayoutGrid, UserCheck, Award, Wallet, Users } from 'lucide-react';
import { AnalyticsOverviewTab } from './AnalyticsOverviewTab';
import { AnalyticsAttendanceTab } from './AnalyticsAttendanceTab';
import { AnalyticsAcademicsTab } from './AnalyticsAcademicsTab';
import { AnalyticsFinanceTab } from './AnalyticsFinanceTab';
import { AnalyticsStaffTab } from './AnalyticsStaffTab';

export const AdminAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
          <Badge variant="outline" className="border-indigo-500/30 text-xs text-indigo-600">
            <BarChart3 className="mr-1 h-3 w-3" />
            School-wide Insights
          </Badge>
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Enrollment, attendance, academics, finance, and staff performance at a glance.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-10 flex-wrap rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="overview" className="rounded-lg px-3 text-xs font-semibold">
            <LayoutGrid className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-lg px-3 text-xs font-semibold">
            <UserCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="academics" className="rounded-lg px-3 text-xs font-semibold">
            <Award className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
            Academics
          </TabsTrigger>
          <TabsTrigger value="finance" className="rounded-lg px-3 text-xs font-semibold">
            <Wallet className="mr-1.5 h-3.5 w-3.5 text-teal-500" />
            Finance
          </TabsTrigger>
          <TabsTrigger value="staff" className="rounded-lg px-3 text-xs font-semibold">
            <Users className="mr-1.5 h-3.5 w-3.5 text-violet-500" />
            Staff
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-4 focus:outline-hidden">
          <AnalyticsOverviewTab />
        </TabsContent>
        <TabsContent value="attendance" className="pt-4 focus:outline-hidden">
          <AnalyticsAttendanceTab />
        </TabsContent>
        <TabsContent value="academics" className="pt-4 focus:outline-hidden">
          <AnalyticsAcademicsTab />
        </TabsContent>
        <TabsContent value="finance" className="pt-4 focus:outline-hidden">
          <AnalyticsFinanceTab />
        </TabsContent>
        <TabsContent value="staff" className="pt-4 focus:outline-hidden">
          <AnalyticsStaffTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
