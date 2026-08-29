import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PiChartBar, PiSquaresFour, PiUserCheck, PiMedal, PiWallet, PiUsers } from 'react-icons/pi';
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
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
            <PiChartBar className="mr-1 h-3 w-3" />
            School-wide Insights
          </Badge>
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Enrollment, attendance, academics, finance, and staff performance at a glance.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-10 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="overview" className="rounded-md px-3 text-xs font-semibold">
            <PiSquaresFour className="mr-1.5 h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="attendance" className="rounded-md px-3 text-xs font-semibold">
            <PiUserCheck className="mr-1.5 h-3.5 w-3.5" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="academics" className="rounded-md px-3 text-xs font-semibold">
            <PiMedal className="mr-1.5 h-3.5 w-3.5" />
            Academics
          </TabsTrigger>
          <TabsTrigger value="finance" className="rounded-md px-3 text-xs font-semibold">
            <PiWallet className="mr-1.5 h-3.5 w-3.5" />
            Finance
          </TabsTrigger>
          <TabsTrigger value="staff" className="rounded-md px-3 text-xs font-semibold">
            <PiUsers className="mr-1.5 h-3.5 w-3.5" />
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
