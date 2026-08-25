import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PiShieldCheck,
  PiArrowRight,
  PiFileXls,
  PiMagnifyingGlass,
  PiUserPlus,
  PiCheckCircle,
  PiEnvelopeSimple,
  PiX,
  PiCheck,
  PiReceipt,
  PiUsers,
  PiCalendarCheck,
  PiUser,
} from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DemoStudent {
  id: string;
  name: string;
  father: string;
  class: string;
  roll: string;
  phone: string;
  feeStatus: 'Paid' | 'Pending';
  feeAmount: number;
  present: boolean;
  attendancePct: number;
}

const INITIAL_STUDENTS: DemoStudent[] = [
  {
    id: 'STU00000001',
    name: 'Aryan Sharma',
    father: 'Rajesh Sharma',
    class: '10-A',
    roll: '01',
    phone: '98765 43210',
    feeStatus: 'Paid',
    feeAmount: 4500,
    present: true,
    attendancePct: 96,
  },
  {
    id: 'STU00000002',
    name: 'Diya Verma',
    father: 'Suresh Verma',
    class: '10-A',
    roll: '02',
    phone: '98765 43211',
    feeStatus: 'Paid',
    feeAmount: 4500,
    present: true,
    attendancePct: 98,
  },
  {
    id: 'STU00000003',
    name: 'Kabir Patel',
    father: 'Manish Patel',
    class: '10-A',
    roll: '03',
    phone: '98765 43212',
    feeStatus: 'Pending',
    feeAmount: 4500,
    present: false,
    attendancePct: 92,
  },
  {
    id: 'STU00000004',
    name: 'Ananya Gupta',
    father: 'Vikas Gupta',
    class: '10-B',
    roll: '04',
    phone: '98765 43213',
    feeStatus: 'Paid',
    feeAmount: 4500,
    present: true,
    attendancePct: 95,
  },
  {
    id: 'STU00000005',
    name: 'Rohan Mehra',
    father: 'Sunil Mehra',
    class: '10-B',
    roll: '05',
    phone: '98765 43214',
    feeStatus: 'Pending',
    feeAmount: 4500,
    present: true,
    attendancePct: 94,
  },
];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  // Interactive Live State
  const [students, setStudents] = useState<DemoStudent[]>(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [activeView, setActiveView] = useState<'students' | 'attendance' | 'fees'>('students');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DemoStudent | null>(null);
  const [isNewAdmissionOpen, setIsNewAdmissionOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('10-A');
  const [newStudentFather, setNewStudentFather] = useState('');

  // Filtered Roster
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesClass = selectedClass === 'All' || s.class === selectedClass;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.father.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.roll.includes(q);
      return matchesClass && matchesSearch;
    });
  }, [students, searchQuery, selectedClass]);

  // Live KPI Calculations
  const presentCount = students.filter((s) => s.present).length;
  const attendanceRate = Math.round((presentCount / students.length) * 100);
  const paidCount = students.filter((s) => s.feeStatus === 'Paid').length;
  const totalCollected = paidCount * 4500;

  // Toggle Single Attendance
  const toggleAttendance = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, present: !s.present } : s)));
  };

  // Mark All Present
  const markAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, present: true })));
    toast.success('Marked all students present for today!');
  };

  // Collect Fee
  const handleCollectFee = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, feeStatus: 'Paid' } : s)));
    toast.success('Fee receipt generated & status updated to Paid!');
  };

  // Simulate Excel Import
  const handleSimulateImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      toast.success('Imported 25 records from Student_List_2026.xlsx successfully!');
    }, 1000);
  };

  // Add new student handler
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const newStudent: DemoStudent = {
      id: `STU0000000${students.length + 1}`,
      name: newStudentName.trim(),
      father: newStudentFather.trim() || 'Parent/Guardian',
      class: newStudentClass,
      roll: String(students.length + 1).padStart(2, '0'),
      phone: `98765 ${43210 + students.length}`,
      feeStatus: 'Paid',
      feeAmount: 4500,
      present: true,
      attendancePct: 100,
    };

    setStudents((prev) => [newStudent, ...prev]);
    setNewStudentName('');
    setNewStudentFather('');
    setIsNewAdmissionOpen(false);
    toast.success(`Enrolled ${newStudent.name} into Class ${newStudent.class}!`);
  };

  return (
    <section className="relative overflow-hidden bg-slate-50/70 py-12 text-slate-900 sm:py-12 dark:bg-zinc-950 dark:text-white">
      {/* Soft atmospheric ambient glow */}
      <div className="bg-primary/5 pointer-events-none absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 right-10 -z-10 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Authentic, Grounded Copy & Actions */}
          <div className="space-y-6 text-center lg:col-span-5 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Gyandeep Baal Vikas Vidya Mandir</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-[1.15] dark:text-white">
                School Management Made Clear & Simple
              </h1>
              <p className="text-base font-semibold text-slate-700 sm:text-lg dark:text-zinc-300">
                Admissions, attendance, fee ledgers, and exam grading in one synchronized workspace.
              </p>
            </div>

            <p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed sm:text-base lg:mx-0">
              Test the live interactive preview on the right — search students, mark attendance roll
              calls, collect fee receipts, and test Excel import in real time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 pt-1 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                onClick={() => navigate('/auth/login')}
                className="bg-primary hover:bg-primary/90 h-11 w-full rounded-lg px-6 font-semibold text-white shadow-sm transition-all sm:w-auto"
              >
                <PiShieldCheck className="mr-2 h-4 w-4" />
                <span>Sign In to Portal</span>
                <PiArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                size="lg"
                onClick={() => navigate('/contact')}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-6 font-medium text-slate-800 shadow-xs transition-all hover:bg-slate-50 sm:w-auto dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <PiEnvelopeSimple className="mr-2 h-4 w-4 text-slate-500" />
                <span>Contact Office</span>
              </Button>
            </div>

            {/* Practical feature tags */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-2 text-xs font-medium text-slate-600 lg:justify-start dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <PiCheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Bulk Excel CSV import</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PiCheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Automated fee receipts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PiCheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>1-Click daily roll call</span>
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Interactive Live Application Interface */}
          <div className="relative mx-auto w-full max-w-2xl lg:col-span-7">
            {/* Main Application Window */}
            <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white text-slate-900 shadow-2xl transition-all dark:border-zinc-800 dark:bg-zinc-900">
              {/* App Titlebar */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="ml-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Gyandeep Portal · Live Interactive Workspace
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    ● Live Demo
                  </span>
                  <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white">
                    AD
                  </div>
                </div>
              </div>

              {/* View Switcher Tabs (Students / Attendance / Fees) */}
              <div className="flex border-b border-slate-100 bg-slate-50/50 px-3 pt-2 text-xs font-semibold dark:border-zinc-800 dark:bg-zinc-900/50">
                <button
                  type="button"
                  onClick={() => setActiveView('students')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 transition-all ${
                    activeView === 'students'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PiUsers className="h-3.5 w-3.5" />
                  <span>Student Directory</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('attendance')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 transition-all ${
                    activeView === 'attendance'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PiCalendarCheck className="h-3.5 w-3.5" />
                  <span>Roll Call ({attendanceRate}%)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('fees')}
                  className={`flex items-center gap-1.5 border-b-2 px-3 py-2 transition-all ${
                    activeView === 'fees'
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PiReceipt className="h-3.5 w-3.5" />
                  <span>Fee Collection</span>
                </button>
              </div>

              {/* Action Toolbar */}
              <div className="border-b border-slate-100 p-3.5 dark:border-zinc-800">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1">
                    <PiMagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Type name, roll, father, or phone to test search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-9 w-full rounded-md border border-slate-200 bg-white pr-8 pl-8 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 text-xs"
                      >
                        <PiX className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateImport}
                      disabled={isImporting}
                      className="inline-flex h-9 items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition-all hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                    >
                      <PiFileXls className="h-4 w-4" />
                      <span>{isImporting ? 'Importing...' : 'Excel Import'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsNewAdmissionOpen(true)}
                      className="bg-primary inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-white transition-all hover:opacity-90"
                    >
                      <PiUserPlus className="h-4 w-4" />
                      <span>+ Admission</span>
                    </button>
                  </div>
                </div>

                {/* Filter Badges */}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {['All', '10-A', '10-B'].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setSelectedClass(cls)}
                        className={`rounded px-2.5 py-0.5 text-[10px] font-semibold transition-all ${
                          selectedClass === cls
                            ? 'bg-primary text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {cls === 'All' ? 'All Classes' : `Class ${cls}`}
                      </button>
                    ))}
                  </div>

                  {activeView === 'attendance' && (
                    <button
                      type="button"
                      onClick={markAllPresent}
                      className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-[11px] font-semibold"
                    >
                      <PiCheck className="h-3.5 w-3.5" />
                      <span>Mark All Present</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Admission Form Drawer */}
              {isNewAdmissionOpen && (
                <form
                  onSubmit={handleAddStudent}
                  className="animate-in fade-in slide-in-from-top-2 border-b border-blue-200 bg-blue-50/70 p-3 text-xs duration-150 dark:border-blue-900/50 dark:bg-blue-950/30"
                >
                  <div className="mb-2 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span className="flex items-center gap-1.5">
                      <PiUserPlus className="text-primary h-3.5 w-3.5" />
                      <span>Quick Student Admission</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsNewAdmissionOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <PiX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="Student full name *"
                      required
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="h-8 rounded border border-slate-200 bg-white px-2.5 text-xs outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <input
                      type="text"
                      placeholder="Father's name"
                      value={newStudentFather}
                      onChange={(e) => setNewStudentFather(e.target.value)}
                      className="h-8 rounded border border-slate-200 bg-white px-2.5 text-xs outline-none dark:border-zinc-700 dark:bg-zinc-800"
                    />
                    <div className="flex gap-1.5">
                      <select
                        value={newStudentClass}
                        onChange={(e) => setNewStudentClass(e.target.value)}
                        className="h-8 flex-1 rounded border border-slate-200 bg-white px-2 text-xs outline-none dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        <option value="10-A">Class 10-A</option>
                        <option value="10-B">Class 10-B</option>
                      </select>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-primary/90 h-8 rounded px-3 text-xs font-semibold text-white shadow-xs"
                      >
                        Admit
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Realistic Student Records Table with Clickable Rows */}
              <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto text-xs dark:divide-zinc-800">
                {filteredStudents.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p>No student found matching "{searchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedClass('All');
                      }}
                      className="text-primary mt-1 text-xs font-semibold hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  filteredStudents.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className={`flex cursor-pointer items-center justify-between px-4 py-2.5 transition-colors hover:bg-blue-50/50 dark:hover:bg-zinc-800/60 ${
                        selectedStudent?.id === s.id ? 'bg-blue-50/80 dark:bg-zinc-800' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 font-mono text-[10px] font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                          {s.roll}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{s.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                            Class {s.class} · Father: {s.father}
                          </p>
                        </div>
                      </div>

                      {/* View-Specific Interactive Controls */}
                      <div className="flex items-center gap-2">
                        {activeView === 'students' && (
                          <>
                            <span className="hidden font-mono text-[11px] text-slate-600 sm:inline dark:text-zinc-400">
                              {s.phone}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                s.feeStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              Fee {s.feeStatus}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {s.attendancePct}%
                            </span>
                          </>
                        )}

                        {activeView === 'attendance' && (
                          <button
                            type="button"
                            onClick={(e) => toggleAttendance(s.id, e)}
                            className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                              s.present
                                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}
                          >
                            {s.present ? '✓ Present' : '✗ Absent'}
                          </button>
                        )}

                        {activeView === 'fees' && (
                          <>
                            {s.feeStatus === 'Paid' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <PiCheckCircle className="h-3 w-3" />
                                <span>₹{s.feeAmount} Paid</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleCollectFee(s.id, e)}
                                className="bg-primary hover:bg-primary/90 rounded-md px-2.5 py-1 text-[10px] font-bold text-white shadow-xs"
                              >
                                Collect ₹{s.feeAmount}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Active Selected Student Detail Bar */}
              {selectedStudent && (
                <div className="flex items-center justify-between border-t border-blue-100 bg-blue-50/80 px-4 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <PiUser className="text-primary h-3.5 w-3.5" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">
                        {selectedStudent.name}
                      </strong>{' '}
                      ({selectedStudent.id}) · Roll {selectedStudent.roll}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/auth/login')}
                      className="text-primary text-[11px] font-semibold hover:underline"
                    >
                      Open Full Profile →
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                    >
                      <PiX className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Status Footbar */}
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                <span>
                  Showing {filteredStudents.length} of {students.length} students · Click row for
                  profile
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  ● Real-Time Mockup
                </span>
              </div>
            </div>

            {/* Interactive Dynamic KPI Bar */}
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Active Roster</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                  {students.length} Enrolled
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Live Attendance</p>
                <p className="mt-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {attendanceRate}% ({presentCount}/{students.length})
                </p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-white p-2.5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">Fees Collected</p>
                <p className="mt-0.5 text-sm font-bold text-blue-600 dark:text-blue-400">
                  ₹{(totalCollected / 1000).toFixed(1)}k ({paidCount}/{students.length})
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
