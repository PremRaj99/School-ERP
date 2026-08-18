import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';

const teacherExamSchedule = [
  {
    examTitle: 'Mid-Term Assessment 2025-2026',
    subject: 'Mathematics (MATH101)',
    class: 'Class 10-A',
    date: '15-10-2025',
    time: '09:00 - 12:00 PM',
    room: 'Hall 1',
    status: 'Ready for Grading',
  },
  {
    examTitle: 'Mid-Term Assessment 2025-2026',
    subject: 'Applied Calculus (CAL201)',
    class: 'Class 11-A',
    date: '18-10-2025',
    time: '09:00 - 12:00 PM',
    room: 'Hall 3',
    status: 'Grading Completed',
  },
  {
    examTitle: 'Pre-Board Examination Series 1',
    subject: 'Mathematics (MATH101)',
    class: 'Class 10-A',
    date: '10-12-2025',
    time: '09:00 - 12:00 PM',
    room: 'Hall 1',
    status: 'Upcoming Exam',
  },
];

export const TeacherExams: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Faculty Examination Duty & Schedules
            </h1>
            <Badge variant="outline" className="border-indigo-500/30 text-xs text-indigo-600">
              Invigilation & Evaluation
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Monitor assigned exam dates, invigilation duty halls, and evaluate submission sheets.
          </p>
        </div>

        <Button
          onClick={() => navigate('/teacher/results')}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Award className="h-3.5 w-3.5" />
          <span>Open Grading Sheet</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {teacherExamSchedule.map((item, idx) => (
          <Card
            key={idx}
            className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px]">
                  {item.class}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    item.status === 'Grading Completed'
                      ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : item.status === 'Ready for Grading'
                        ? 'border-indigo-500/30 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {item.status}
                </Badge>
              </div>

              <CardTitle className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {item.examTitle}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                {item.subject}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pt-0 text-xs">
              <div className="space-y-1 rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Exam Date:</span>
                  <span className="font-semibold">{item.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Timing:</span>
                  <span>{item.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Assigned Venue:</span>
                  <span className="font-semibold">{item.room}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 dark:border-zinc-800">
                <Button
                  size="sm"
                  className="h-8 w-full bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                  onClick={() => navigate('/teacher/results')}
                >
                  <span>Evaluate & Enter Marks</span>
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeacherExams;
