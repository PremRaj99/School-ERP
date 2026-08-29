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
  PiUsers,
  PiGraduationCap,
  PiBookOpen,
  PiCalendar,
  PiCreditCard,
  PiBell,
  PiSun,
  PiMoon,
  PiLaptop,
  PiSquaresFour,
  PiHouse,
  PiUserCheck,
  PiListChecks,
  PiCertificate,
  PiChatCircleText,
  PiShield,
  PiFileXls,
  PiGear,
} from 'react-icons/pi';
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
            <PiHouse className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Public Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/contact'))}>
            <PiChatCircleText className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Contact & Inquiries</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/auth/login'))}>
            <PiShield className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Login Portal</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Admin Modules">
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/dashboard'))}>
            <PiSquaresFour className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Admin Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/students'))}>
            <PiGraduationCap className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Student Management</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/teachers'))}>
            <PiUsers className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Teacher Management</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/classes'))}>
            <PiBookOpen className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Classes & Sections</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/subjects'))}>
            <PiBookOpen className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Subjects Curriculum</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/exams'))}>
            <PiCertificate className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Exams & Result Declaration</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/finance'))}>
            <PiCreditCard className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Finance & Fee Ledger</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/academic'))}>
            <PiCalendar className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Academic Timetable & Calendar</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/notices'))}>
            <PiBell className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Notice Bulletin</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/attendance'))}>
            <PiUserCheck className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Teacher Attendance</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/attendance/student'))}>
            <PiListChecks className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Student Attendance</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/admin/contact'))}>
            <PiChatCircleText className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Inquiry Messages</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Teacher Portal">
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/dashboard'))}>
            <PiSquaresFour className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Teacher Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/attendance'))}>
            <PiUserCheck className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Mark Daily Attendance</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/results'))}>
            <PiFileXls className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Exam Grading & Marks Entry</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/exams'))}>
            <PiCertificate className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Exam Schedules</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/salary'))}>
            <PiCreditCard className="text-muted-foreground mr-2 h-4 w-4" />
            <span>My Honorarium Slips</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/teacher/profile'))}>
            <PiGear className="mr-2 h-4 w-4 text-slate-500" />
            <span>Teacher Profile</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Student Portal">
          <CommandItem onSelect={() => runCommand(() => navigate('/student/dashboard'))}>
            <PiSquaresFour className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Student Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/attendance'))}>
            <PiUserCheck className="text-muted-foreground mr-2 h-4 w-4" />
            <span>My Attendance Records</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/exams'))}>
            <PiCertificate className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Exams & Report Cards</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/fees'))}>
            <PiCreditCard className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Fee Dues & Payment Receipts</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/subjects'))}>
            <PiBookOpen className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Enrolled Subjects & Syllabus</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/student/profile'))}>
            <PiGear className="mr-2 h-4 w-4 text-slate-500" />
            <span>Digital ID Card & Profile</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme Settings">
          <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
            <PiSun className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
            <PiMoon className="text-muted-foreground mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
            <PiLaptop className="mr-2 h-4 w-4 text-slate-400" />
            <span>System Default</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandMenu;
