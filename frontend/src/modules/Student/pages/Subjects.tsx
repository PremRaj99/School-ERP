import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle } from 'lucide-react';

const enrolledSubjects = [
  {
    code: 'MATH101',
    title: 'Mathematics & Applied Algebra',
    teacher: 'Prof. Meenakshi Sundaram',
    credits: '4.0 Credits',
    topics: [
      'Real Numbers & Polynomials',
      'Pair of Linear Equations',
      'Quadratic Equations & AP',
      'Trigonometry & Geometry',
    ],
  },
  {
    code: 'PHY201',
    title: 'General & Experimental Physics',
    teacher: 'Prof. Vikram Choudhary',
    credits: '4.0 Credits',
    topics: [
      'Light: Reflection & Refraction',
      'Human Eye and Colourful World',
      'Electricity & Ohm Law',
      'Magnetic Effects of Electric Current',
    ],
  },
  {
    code: 'CHEM301',
    title: 'Inorganic & Organic Chemistry',
    teacher: 'Prof. Rajesh Nair',
    credits: '4.0 Credits',
    topics: [
      'Chemical Reactions & Equations',
      'Acids, Bases and Salts',
      'Metals and Non-metals',
      'Carbon and its Compounds',
    ],
  },
  {
    code: 'ENG001',
    title: 'English Literature & Composition',
    teacher: 'Prof. Anjali Kapoor',
    credits: '3.0 Credits',
    topics: [
      'Prose & Fiction Essays',
      'Poetry Analysis',
      'Formal Letters & Writing',
      'Applied Grammar & Lexicon',
    ],
  },
  {
    code: 'CS501',
    title: 'Computer Science & Python',
    teacher: 'Prof. Alok Mehta',
    credits: '3.0 Credits',
    topics: [
      'Python Data Types & Flow Control',
      'Functions & Modules',
      'Database Management with SQL',
      'Cyber Ethics & Security',
    ],
  },
];

export const StudentSubjects: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Enrolled Subjects & Syllabus</h1>
            <Badge variant="outline" className="border-indigo-500/30 text-xs text-indigo-600">
              Class 10-A Curriculum
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Registered academic courses, syllabus modules, assigned instructors, and credit points.
          </p>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {enrolledSubjects.map((sub) => (
          <Card
            key={sub.code}
            className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-indigo-50 font-mono text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                >
                  {sub.code}
                </Badge>
                <span className="text-muted-foreground text-[11px] font-semibold">
                  {sub.credits}
                </span>
              </div>
              <CardTitle className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {sub.title}
              </CardTitle>
              <CardDescription className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                <User className="h-3 w-3" />
                <span>{sub.teacher}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pt-0 text-xs">
              <div className="space-y-1.5 rounded-xl bg-slate-50 p-3 dark:bg-zinc-800/50">
                <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                  Core Syllabus Modules
                </span>
                {sub.topics.map((topic, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-zinc-300"
                  >
                    <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentSubjects;
