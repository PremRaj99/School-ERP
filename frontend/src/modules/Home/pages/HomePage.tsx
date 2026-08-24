import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Award,
  CreditCard,
  ArrowRight,
  Sparkles,
  School,
  Lock,
  CheckCircle,
  TrendingUp,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('admin');

  return (
    <div className="space-y-16 overflow-hidden pb-20">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-12 text-center sm:px-6 md:pt-20 lg:px-8">
        {/* Background Ambient Glows */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-137.5 w-137.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-indigo-500/20 via-violet-500/20 to-sky-500/10 blur-3xl" />

        <div className="animate-pulse-subtle mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Generation Unified School ERP 2.0</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl leading-tight font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white">
          Empowering Modern Education with{' '}
          <span className="bg-linear-to-r from-indigo-600 via-violet-600 to-sky-600 bg-clip-text text-transparent">
            Intelligent School Management
          </span>
        </h1>

        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg">
          A unified, state-of-the-art enterprise portal connecting administrators, faculty members,
          and students in real time with automated attendance, exam grading, fee invoicing, and
          timetables.
        </p>

        {/* Main CTA Buttons: Login & Contact Us */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/auth/login')}
            className="h-11 w-full rounded-xl bg-indigo-600 px-7 font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 sm:w-auto"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            <span>Login to Portal</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <Button
            size="lg"
            onClick={() => navigate('/contact')}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white/90 px-7 font-semibold text-slate-800 shadow-sm hover:bg-slate-100 sm:w-auto dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <Mail className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Contact Us</span>
          </Button>
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-zinc-300">
              <Lock className="h-3.5 w-3.5 text-indigo-500" />
              <span>Instant Test & Demo Credentials (Click to Sign In directly)</span>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              Friction-Free Testing
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="group rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-left transition-all hover:bg-indigo-100/60 dark:border-indigo-950/50 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Admin Demo
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-indigo-500 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">User: admin</p>
              <p className="text-muted-foreground text-[10px]">Full school ERP control</p>
            </button>

            <button
              onClick={() => navigate('/teacher/dashboard')}
              className="group rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-left transition-all hover:bg-emerald-100/60 dark:border-emerald-950/50 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Faculty Demo
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-emerald-500 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                User: teacher
              </p>
              <p className="text-muted-foreground text-[10px]">Attendance & grade sheets</p>
            </button>

            <button
              onClick={() => navigate('/student/dashboard')}
              className="group rounded-xl border border-sky-100 bg-sky-50/50 p-3 text-left transition-all hover:bg-sky-100/60 dark:border-sky-950/50 dark:bg-sky-950/30 dark:hover:bg-sky-900/40"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  Student Demo
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-sky-500 transition-transform group-hover:translate-x-1" />
              </div>
              <p className="text-[11px] text-sky-700/80 dark:text-sky-300/80">User: student</p>
              <p className="text-muted-foreground text-[10px]">Report cards & fee dues</p>
            </button>
          </div>
        </div>
      </section>

      {/* Live Interactive Portal Showcase Tabs */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl space-y-2 text-center">
          <Badge variant="outline" className="text-xs text-indigo-600 dark:text-indigo-400">
            Tailored Experiences
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Designed for Every Role in the Campus
          </h2>
          <p className="text-muted-foreground text-sm">
            Explore how Gyan Deep BVM simplifies workflows for administrators, instructors, and
            learners.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8 flex justify-center">
            <TabsList className="h-11 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
              <TabsTrigger
                value="admin"
                className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs dark:data-[state=active]:bg-zinc-900"
              >
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                <span>Administration Suite</span>
              </TabsTrigger>
              <TabsTrigger
                value="teacher"
                className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs dark:data-[state=active]:bg-zinc-900"
              >
                <Users className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                <span>Faculty Workspace</span>
              </TabsTrigger>
              <TabsTrigger
                value="student"
                className="rounded-lg px-4 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-xs dark:data-[state=active]:bg-zinc-900"
              >
                <GraduationCap className="mr-1.5 h-3.5 w-3.5 text-sky-500" />
                <span>Student Hub</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Admin Tab Content */}
          <TabsContent value="admin" className="focus:outline-hidden">
            <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
              <div className="grid grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-2">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    <School className="h-3.5 w-3.5" /> Full Operational Governance
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    Centralized Academic & Financial Control
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Gain instant oversight into enrolled student counts, staff deployment, fee
                    collection ledgers, timetable generation, and formal result publications with
                    complete audit trails.
                  </p>
                  <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                    {[
                      'Student & Staff Roster Directory',
                      'Automated Fee Ledger & Receipts',
                      'Exam Master & Result Publishing',
                      'Academic Timetables & Event Calendar',
                      'Emergency Circulars & Notices',
                      'Interactive Analytics Dashboards',
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300"
                      >
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={() => navigate('/admin/dashboard')}
                      className="bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      <span>Explore Admin Portal</span>
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Mock UI Card Preview */}
                <div className="space-y-4 rounded-2xl border border-indigo-500/20 bg-linear-to-br from-slate-900 to-indigo-950 p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="font-mono text-xs text-indigo-300">
                      admin.gyandeep-bvm.live
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
                      <span className="text-[11px] text-indigo-200">Active Students</span>
                      <p className="mt-1 text-xl font-bold">1,248</p>
                      <span className="text-[10px] text-emerald-400">↑ 12% this session</span>
                    </div>
                    <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
                      <span className="text-[11px] text-indigo-200">Faculty Staff</span>
                      <p className="mt-1 text-xl font-bold">84</p>
                      <span className="text-[10px] text-indigo-300">98% Present Today</span>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-indigo-200">Fee Realization</span>
                      <span className="font-bold text-emerald-400">₹18.4L / ₹22.0L</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                      <div className="h-full w-[84%] rounded-full bg-linear-to-r from-emerald-400 to-teal-300" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Teacher Tab Content */}
          <TabsContent value="teacher" className="focus:outline-hidden">
            <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
              <div className="grid grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-2">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <Users className="h-3.5 w-3.5" /> High-Efficiency Faculty Tools
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    Smart Attendance & Frictionless Grading
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Designed for fast daily classroom administration. Mark student roll calls in
                    seconds, input exam marks with instant auto-grading (A/B/C/F), view monthly
                    payslips, and check assigned timetables.
                  </p>
                  <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                    {[
                      '1-Click "Mark All Present" attendance',
                      'Direct marksheet input with live grade calculation',
                      'Classroom schedule & period timeline',
                      'Monthly salary breakdown & payslip download',
                      'Official notice board access',
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300"
                      >
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={() => navigate('/teacher/dashboard')}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <span>Explore Faculty Workspace</span>
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-linear-to-br from-slate-900 to-emerald-950 p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-semibold text-emerald-300">
                      Class 10-A • Mathematics
                    </span>
                    <Badge
                      variant="outline"
                      className="border-emerald-500/30 text-[10px] text-emerald-300"
                    >
                      Period 3
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-xs">
                      <span>Roll 101 • Aryan Sharma</span>
                      <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        Present
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-xs">
                      <span>Roll 102 • Diya Verma</span>
                      <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                        Present
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white/10 p-2 text-xs">
                      <span>Roll 103 • Kabir Patel</span>
                      <span className="rounded-full bg-rose-500/30 px-2 py-0.5 text-[10px] font-semibold text-rose-300">
                        Absent
                      </span>
                    </div>
                  </div>
                  <div className="pt-1 text-center">
                    <span className="text-[11px] text-emerald-300">
                      Attendance Recorded • 42/44 Students Present (95.4%)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Student Tab Content */}
          <TabsContent value="student" className="focus:outline-hidden">
            <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90">
              <div className="grid grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-2">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                    <GraduationCap className="h-3.5 w-3.5" /> Modern Student Experience
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    Academic Growth & Performance Transparency
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Students and parents can track daily attendance percentages, download official
                    term-end marksheets, review fee breakdown and pay online, and access digital
                    student ID cards anytime.
                  </p>
                  <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                    {[
                      'Interactive Monthly Attendance Calendar',
                      'Downloadable Official Report Cards',
                      'Subject Syllabus & Credit Breakdown',
                      'Online Fee Invoicing & Payment History',
                      'Digital Printable Student ID Card',
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-zinc-300"
                      >
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={() => navigate('/student/dashboard')}
                      className="bg-sky-600 text-white hover:bg-sky-700"
                    >
                      <span>Explore Student Hub</span>
                      <ArrowRight className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-sky-500/20 bg-linear-to-br from-slate-900 to-sky-950 p-6 text-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                        AS
                      </div>
                      <div>
                        <p className="text-xs font-bold">Aryan Sharma</p>
                        <p className="text-[10px] text-sky-300">Class 10-A • Roll 101</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-emerald-400/30 text-[10px] text-emerald-400"
                    >
                      Attendance 94.2%
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-white/10 p-2.5">
                      <span className="text-[10px] text-sky-200">Term GPA</span>
                      <p className="mt-0.5 text-base font-bold text-white">3.92</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-2.5">
                      <span className="text-[10px] text-sky-200">Exams</span>
                      <p className="mt-0.5 text-base font-bold text-white">Passed</p>
                    </div>
                    <div className="rounded-lg bg-white/10 p-2.5">
                      <span className="text-[10px] text-sky-200">Fee Status</span>
                      <p className="mt-0.5 text-base font-bold text-emerald-400">Paid</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs">
                    <span className="text-sky-200">Upcoming: Science Mid-Term</span>
                    <span className="text-[10px] font-semibold text-amber-300">In 3 Days</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Feature Highlights Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
          <Badge variant="outline" className="text-xs text-indigo-600 dark:text-indigo-400">
            Enterprise Capabilities
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Built for Scale, Reliability & Aesthetics
          </h2>
          <p className="text-muted-foreground text-sm">
            Everything your educational institution needs under a single responsive dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <CardContent className="space-y-3 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 font-bold text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold">Real-Time Analytics</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Dynamic visual dashboards with Recharts for attendance trends, revenue collection vs
                expenses, and student demographic distributions.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <CardContent className="space-y-3 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold">Automated Billing & Payroll</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Generate monthly fee invoices, track online payments, print receipts, and manage
                faculty salary disbursements seamlessly.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80">
            <CardContent className="space-y-3 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 font-bold text-amber-600 dark:text-amber-400">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold">Exam & Grade Management</h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Build exam timetables, input subject-wise marks with validation, calculate letter
                grades, and publish digital report cards.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust & Stats Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-indigo-500/20 bg-linear-to-r from-indigo-900 via-indigo-950 to-slate-900 p-8 text-center text-white shadow-2xl sm:p-12">
          <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to experience the future of school management?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-200">
            Test any module instantly with our pre-populated sample database and interactive
            portals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth/login')}
              className="h-11 bg-white px-6 font-bold text-indigo-950 shadow-lg hover:bg-slate-100"
            >
              <ShieldCheck className="mr-2 h-4 w-4 text-indigo-600" />
              <span>Login to Portal</span>
              <ArrowRight className="ml-2 h-4 w-4 text-indigo-600" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              className="h-11 border border-white/30 bg-white/10 px-6 font-semibold text-white shadow-sm backdrop-blur-xs hover:bg-white/20 hover:text-white"
            >
              <Mail className="mr-2 h-4 w-4 text-indigo-200" />
              <span>Contact Us</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
