import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  Sun,
  Moon,
  Laptop,
  LayoutDashboard,
  Home,
  UserCheck,
  Award,
  MessageSquare,
  Shield,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import { useTheme } from '@/shared/common/theme';

interface CommandMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled && controlledOnOpenChange ? controlledOnOpenChange : setInternalOpen;

  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isInputFocused())) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    const isInputFocused = () => {
      const activeElement = document.activeElement;
      return (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute('contenteditable') === 'true'
      );
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command, page, or search..." />
      <CommandList className="max-h-87.5">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <Home className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Public Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/contact'))}>
            <MessageSquare className="mr-2 h-4 w-4 text-sky-500" />
            <span>Contact & Inquiries</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/auth/login'))}>
            <Shield className="mr-2 h-4 w-4 text-amber-500" />
            <span>Login Portal</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Admin Modules">
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Admin Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/students'))}>
            <GraduationCap className="mr-2 h-4 w-4 text-blue-500" />
            <span>Student Management</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/teachers'))}>
            <Users className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Teacher Management</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/classes'))}>
            <BookOpen className="mr-2 h-4 w-4 text-violet-500" />
            <span>Classes & Sections</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/subjects'))}>
            <BookOpen className="mr-2 h-4 w-4 text-pink-500" />
            <span>Subjects Curriculum</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/exams'))}>
            <Award className="mr-2 h-4 w-4 text-amber-500" />
            <span>Exams & Result Declaration</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/finance'))}>
            <CreditCard className="mr-2 h-4 w-4 text-emerald-600" />
            <span>Finance & Fee Ledger</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/academic'))}>
            <Calendar className="mr-2 h-4 w-4 text-purple-500" />
            <span>Academic Timetable & Calendar</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/notices'))}>
            <Bell className="mr-2 h-4 w-4 text-orange-500" />
            <span>Notice Bulletin</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/attendance'))}>
            <UserCheck className="mr-2 h-4 w-4 text-teal-500" />
            <span>Attendance Hub</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/contact'))}>
            <MessageSquare className="mr-2 h-4 w-4 text-blue-400" />
            <span>Inquiry Messages</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Teacher Portal">
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Teacher Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/attendance'))}>
            <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Mark Daily Attendance</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/results'))}>
            <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-500" />
            <span>Exam Grading & Marks Entry</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/exams'))}>
            <Award className="mr-2 h-4 w-4 text-amber-500" />
            <span>Exam Schedules</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/salary'))}>
            <CreditCard className="mr-2 h-4 w-4 text-teal-500" />
            <span>My Salary Slips</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/profile'))}>
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            <span>Teacher Profile</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Student Portal">
          <CommandItem onSelect={() => runCommand(() => navigate('/student/dashboard'))}>
            <LayoutDashboard className="mr-2 h-4 w-4 text-indigo-500" />
            <span>Student Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/attendance'))}>
            <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
            <span>My Attendance Records</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/exams'))}>
            <Award className="mr-2 h-4 w-4 text-amber-500" />
            <span>Exams & Report Cards</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/fees'))}>
            <CreditCard className="mr-2 h-4 w-4 text-emerald-500" />
            <span>Fee Dues & Payment Receipts</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/subjects'))}>
            <BookOpen className="mr-2 h-4 w-4 text-purple-500" />
            <span>Enrolled Subjects & Syllabus</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/profile'))}>
            <Settings className="mr-2 h-4 w-4 text-slate-500" />
            <span>Digital ID Card & Profile</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme Settings">
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4 text-amber-500" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4 text-indigo-400" />
            <span>Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <Laptop className="mr-2 h-4 w-4 text-slate-400" />
            <span>System Default</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandMenu;
