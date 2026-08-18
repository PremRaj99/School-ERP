import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar, BookOpen, Award } from 'lucide-react';

export const TeacherProfile: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-2 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold tracking-tight">Faculty Academic Profile</h1>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Official staff credentials, departmental designations, and assigned teaching timetable.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        {/* Left Column: ID & Quick Info */}
        <div className="space-y-4 md:col-span-5">
          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="h-20 bg-linear-to-r from-emerald-600 to-teal-700" />
            <CardContent className="-mt-10 space-y-4 p-5 pt-0">
              <div className="flex items-end justify-between">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-linear-to-tr from-emerald-700 to-teal-500 text-2xl font-black text-white shadow-xl dark:border-zinc-900">
                  MS
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                >
                  Active Faculty
                </Badge>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Prof. Meenakshi Sundaram
                </h2>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  Head of Department • Mathematics
                </p>
                <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                  Employee ID: TCH-001
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-2 text-xs dark:border-zinc-800">
                <div className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-indigo-500" />
                  <span>m.sundaram@aura-erp.edu</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-emerald-500" />
                  <span>+91 98765 01234</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" />
                  <span>Joined Institution: 15-06-2018</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <Award className="h-3.5 w-3.5 text-sky-500" />
                  <span>Qualifications: M.Sc. Mathematics, B.Ed.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Subjects & Bio */}
        <div className="space-y-6 md:col-span-7">
          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">About & Teaching Philosophy</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 text-xs leading-relaxed">
              <p>
                Head of Mathematics Department with 12+ years of senior secondary coaching
                experience. Specializes in advanced calculus, analytical algebra, and Olympiad
                mentoring with strong focus on interactive visualization.
              </p>

              <div className="border-t border-slate-100 pt-2 dark:border-zinc-800">
                <span className="mb-2 block text-[11px] font-semibold text-slate-800 dark:text-zinc-200">
                  Assigned Teaching Disciplines
                </span>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                  >
                    <BookOpen className="mr-1 h-3 w-3" />
                    Mathematics (Class 10-A, 10-B)
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  >
                    <BookOpen className="mr-1 h-3 w-3" />
                    Applied Calculus (Class 11-A)
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Classroom Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span>Class Teacher In-Charge</span>
                <span className="font-bold text-slate-900 dark:text-white">Class 10-A</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span>Total Active Students</span>
                <span className="font-bold text-slate-900 dark:text-white">162 Learners</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span>Weekly Lecture Load</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                  22 Periods / Week
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
