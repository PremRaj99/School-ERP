import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PiShieldCheck,
  PiUsers,
  PiCertificate,
  PiCreditCard,
  PiArrowRight,
  PiBuildings,
  PiCheckCircle,
  PiEnvelopeSimple,
} from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { HeroSection } from '../components/HeroSection';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 overflow-hidden pb-20">
      {/* High-Impact Hero Section */}
      <HeroSection />

      {/* Core ERP Modules & Capabilities */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl space-y-2 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
            <span>Academic & Administrative Suite</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Comprehensive School Management Modules
          </h2>
          <p className="text-muted-foreground text-sm">
            Everything your school needs to run daily academic operations smoothly and
            transparently.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <PiUsers className="h-5 w-5" />,
              title: 'Student Admissions & Roster',
              desc: 'Enroll students with complete demographic records, father and mother contact details, roll number assignment, and bulk Excel roster uploads.',
              link: '/admin/students',
              role: 'Admin & Office',
            },
            {
              icon: <PiCheckCircle className="h-5 w-5" />,
              title: 'Daily Attendance & Roll Call',
              desc: 'Class teachers take daily roll call in seconds with 1-click "Mark All Present", real-time absentee tracking, and monthly attendance percentages.',
              link: '/teacher/attendance',
              role: 'Faculty',
            },
            {
              icon: <PiCreditCard className="h-5 w-5" />,
              title: 'Fee Ledgers & Receipts',
              desc: 'Manage term tuition fees, track pending balances, print automated fee receipts, and monitor session-wise collection totals.',
              link: '/admin/finance',
              role: 'Accounts',
            },
            {
              icon: <PiCertificate className="h-5 w-5" />,
              title: 'Exam Marks & Report Cards',
              desc: 'Configure exam schedules, enter subject marks with validation, calculate letter grades automatically, and generate printable student report cards.',
              link: '/admin/exams',
              role: 'Examination Cell',
            },
            {
              icon: <PiBuildings className="h-5 w-5" />,
              title: 'Timetables & Class Schedules',
              desc: 'Organize period timelines across Class 1 to 12, assign subject teachers without scheduling clashes, and distribute daily timetables.',
              link: '/admin/timetable',
              role: 'Academic Head',
            },
            {
              icon: <PiShieldCheck className="h-5 w-5" />,
              title: 'Faculty & Staff Directory',
              desc: 'Maintain teacher profiles, designated subject allocations, monthly salary ledgers, and publish emergency campus notices.',
              link: '/admin/teachers',
              role: 'Administration',
            },
          ].map((mod, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
                    {mod.icon}
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {mod.role}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{mod.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{mod.desc}</p>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => navigate('/auth/login')}
                  className="text-primary group-hover:text-primary/80 inline-flex items-center text-xs font-semibold"
                >
                  <span>Access Module</span>
                  <PiArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Stats Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-md p-8 text-center text-white shadow-2xl sm:p-12">
          <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to experience the future of school management?
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
            Test any module instantly with our pre-populated sample database and interactive
            portals.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth/login')}
              className="text-primary h-11 bg-white px-6 font-bold shadow-lg hover:bg-slate-100"
            >
              <PiShieldCheck className="mr-2 h-4 w-4" />
              <span>Login to Portal</span>
              <PiArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/contact')}
              className="h-11 border border-white/30 bg-white/10 px-6 font-semibold text-white shadow-sm backdrop-blur-xs hover:bg-white/20 hover:text-white"
            >
              <PiEnvelopeSimple className="mr-2 h-4 w-4 text-white/80" />
              <span>Contact Us</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
