import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  PiSquaresFour,
  PiUsers,
  PiGraduationCap,
  PiBookOpen,
  PiCalendar,
  PiCreditCard,
  PiBell,
  PiFileXls,
  PiUserCheck,
  PiListChecks,
  PiCertificate,
  PiChatCircleText,
  PiMagnifyingGlass,
  PiSignOut,
  PiKey,
  PiList,
  PiX,
  PiCaretDown,
  PiBuildings,
  PiCheckCircle,
  PiWarningCircle,
  PiInfo,
  PiUserCircle,
  PiGear,
  PiChartBar,
} from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuthStore } from '@/stores/auth.store';
import { CommandMenu } from './command-menu';
import { ThemeToggle } from './theme-toggle';
import { authService } from '@/lib/services/auth.service';
import { qk } from '@/lib/query-keys';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const adminNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin/dashboard', icon: PiSquaresFour },
      { title: 'Analytics', href: '/admin/analytics', icon: PiChartBar },
    ],
  },
  {
    title: 'People',
    items: [
      { title: 'Students', href: '/admin/students', icon: PiGraduationCap },
      { title: 'Teachers', href: '/admin/teachers', icon: PiUsers },
      { title: 'Teacher Attendance', href: '/admin/attendance', icon: PiUserCheck },
      { title: 'Student Attendance', href: '/admin/attendance/student', icon: PiListChecks },
    ],
  },
  {
    title: 'Academics',
    items: [
      { title: 'Classes & Sections', href: '/admin/classes', icon: PiBookOpen },
      { title: 'Subjects', href: '/admin/subjects', icon: PiBookOpen },
      { title: 'Exams & Results', href: '/admin/exams', icon: PiCertificate },
      { title: 'Timetable & Calendar', href: '/admin/academic', icon: PiCalendar },
    ],
  },
  {
    title: 'Administration',
    items: [
      { title: 'Finance & Fees', href: '/admin/finance', icon: PiCreditCard },
      { title: 'Notices & Circulars', href: '/admin/notices', icon: PiBell },
      { title: 'Inquiries', href: '/admin/contact', icon: PiChatCircleText },
      { title: 'Account Settings', href: '/admin/settings', icon: PiGear },
    ],
  },
];

const teacherNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Teacher Dashboard', href: '/teacher/dashboard', icon: PiSquaresFour },
      { title: 'Analytics', href: '/teacher/analytics', icon: PiChartBar },
    ],
  },
  {
    title: 'Classroom',
    items: [
      { title: 'My Timetable', href: '/teacher/timetable', icon: PiCalendar },
      { title: 'Mark Attendance', href: '/teacher/attendance', icon: PiUserCheck },
      { title: 'Grading & Marks', href: '/teacher/results', icon: PiFileXls },
      { title: 'Exam Schedules', href: '/teacher/exams', icon: PiCertificate },
    ],
  },
  {
    title: 'Personal',
    items: [
      { title: 'School Notices', href: '/teacher/notices', icon: PiBell },
      { title: 'Salary Slips', href: '/teacher/salary', icon: PiCreditCard },
      { title: 'My Profile', href: '/teacher/profile', icon: PiUsers },
    ],
  },
];

const studentNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Student Dashboard', href: '/student/dashboard', icon: PiSquaresFour },
      { title: 'Analytics', href: '/student/analytics', icon: PiChartBar },
    ],
  },
  {
    title: 'Academics',
    items: [
      { title: 'My Attendance', href: '/student/attendance', icon: PiUserCheck },
      { title: 'Subjects & Syllabus', href: '/student/subjects', icon: PiBookOpen },
      { title: 'Exams & Reports', href: '/student/exams', icon: PiCertificate },
      { title: 'Timetable & Events', href: '/student/academic', icon: PiCalendar },
    ],
  },
  {
    title: 'Accounts & Info',
    items: [
      { title: 'Fees & Invoices', href: '/student/fees', icon: PiCreditCard },
      { title: 'Notice Board', href: '/student/notices', icon: PiBell },
      { title: 'Digital ID & Profile', href: '/student/profile', icon: PiGraduationCap },
    ],
  },
];

const financeNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Finance Dashboard', href: '/finance/dashboard', icon: PiSquaresFour },
      { title: 'Analytics', href: '/finance/analytics', icon: PiChartBar },
    ],
  },
  {
    title: 'Ledger',
    items: [
      { title: 'Student Fees', href: '/finance/fees', icon: PiGraduationCap },
      { title: 'Teacher Salaries', href: '/finance/salaries', icon: PiUsers },
      { title: 'Expenses', href: '/finance/expenses', icon: PiCreditCard },
    ],
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
  role: 'admin' | 'teacher' | 'student' | 'finance';
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, role }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Term-End Examination Schedule',
      desc: 'Final schedules for classes 8-12 released.',
      time: '10m ago',
      type: 'info',
      unread: true,
    },
    {
      id: 2,
      title: 'Monthly Attendance Synced',
      desc: 'Biometric and teacher rosters recorded.',
      time: '1h ago',
      type: 'success',
      unread: true,
    },
    {
      id: 3,
      title: 'Fee Invoice Due Reminder',
      desc: 'Quarterly fee invoices dispatched.',
      time: '3h ago',
      type: 'warning',
      unread: false,
    },
  ]);

  const navSections =
    role === 'admin'
      ? adminNavSections
      : role === 'teacher'
        ? teacherNavSections
        : role === 'finance'
          ? financeNavSections
          : studentNavSections;

  const { data: userProfile } = useQuery({
    queryKey: qk.user.profile(),
    queryFn: () => authService.getUser(),
  });

  const profileRoute: Record<AppLayoutProps['role'], string> = {
    admin: '/admin/settings',
    teacher: '/teacher/profile',
    student: '/student/profile',
    finance: '/finance/dashboard',
  };

  const roleLabels: Record<string, { label: string; badgeClass: string }> = {
    admin: {
      label: 'Admin Portal',
      badgeClass: 'bg-primary/10 text-primary border-primary/30 font-medium',
    },
    teacher: {
      label: 'Faculty Portal',
      badgeClass: 'bg-primary/10 text-primary border-primary/30 font-medium',
    },
    student: {
      label: 'Student Portal',
      badgeClass: 'bg-primary/10 text-primary border-primary/30 font-medium',
    },
    finance: {
      label: 'Finance Portal',
      badgeClass: 'bg-primary/10 text-primary border-primary/30 font-medium',
    },
  };

  const currentRoleConfig = roleLabels[role] || roleLabels.admin;

  const clearAuth = useAuthStore((state) => state.clear);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
      navigate('/auth/login', { replace: true });
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="text-foreground flex min-h-screen bg-slate-50/60 font-sans dark:bg-zinc-950">
      <CommandMenu open={isCommandOpen} onOpenChange={setIsCommandOpen} />

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 z-30 hidden w-64 flex-col border-r border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl lg:flex dark:border-zinc-800/80 dark:bg-zinc-900/95">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/70 px-4 dark:border-zinc-800/80">
          <NavLink to={`/${role}/dashboard`} className="group flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Gyandeep Logo"
              className="h-9 w-9 shrink-0 rounded-md object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Gyandeep
                </span>
                <Badge variant="outline" className="h-4 px-1 py-0 text-[9px] font-medium">
                  ERP
                </Badge>
              </div>
              <p className="text-muted-foreground -mt-0.5 truncate text-[10px]">
                bal vikas vidyamandir
              </p>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 space-y-5 overflow-y-auto px-3.5 py-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-muted-foreground/80 px-2.5 pb-1 text-[11px] font-semibold tracking-wider uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/admin/dashboard' &&
                    item.href !== '/teacher/dashboard' &&
                    item.href !== '/student/dashboard' &&
                    item.href !== '/finance/dashboard' &&
                    location.pathname.startsWith(item.href));

                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive
                            ? 'text-primary'
                            : 'text-slate-400 group-hover:text-slate-700 dark:text-zinc-500 dark:group-hover:text-zinc-300'
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary h-4.5 px-1.5 text-[10px]"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="border-t border-slate-200/70 bg-slate-50/50 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs">
                {role.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs leading-tight font-semibold text-slate-800 dark:text-zinc-200">
                  {userProfile?.username ?? `${role} User`}
                </span>
                <span className="text-muted-foreground text-[10px]">{currentRoleConfig.label}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive h-7 w-7"
              onClick={handleLogout}
              title="Sign out"
            >
              <PiSignOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="animate-in slide-in-from-left relative z-10 flex w-full max-w-xs flex-1 flex-col border-r border-slate-200 bg-white shadow-2xl duration-200 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-zinc-800">
              <NavLink
                to={`/${role}/dashboard`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-2"
              >
                <img
                  src="/logo.png"
                  alt="Gyandeep Logo"
                  className="h-8 w-8 shrink-0 rounded-md object-contain transition-transform group-hover:scale-105"
                />
                <div className="flex flex-col">
                  <span className="text-xs leading-tight font-bold">Gyandeep</span>
                  <span className="text-muted-foreground text-[9px]">bal vikas vidyamandir</span>
                </div>
              </NavLink>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PiX className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
              {navSections.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-muted-foreground px-2 pb-1 text-[11px] font-semibold uppercase">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <Icon className="text-primary h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-zinc-800/80 dark:bg-zinc-900/80">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-600 lg:hidden dark:text-zinc-400"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <PiList className="h-5 w-5" />
            </Button>

            {/* Role Badge */}
            <Badge
              variant="outline"
              className={`hidden sm:inline-flex ${currentRoleConfig.badgeClass}`}
            >
              {currentRoleConfig.label}
            </Badge>

            {/* Quick Command Palette Button */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="text-muted-foreground hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs transition-colors hover:bg-slate-200/70 md:flex dark:border-zinc-700 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/60"
            >
              <PiMagnifyingGlass className="h-3.5 w-3.5" />
              <span>Search modules, commands...</span>
              <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-2xs dark:border-zinc-700 dark:bg-zinc-900">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-600 md:hidden dark:text-zinc-400"
              onClick={() => setIsCommandOpen(true)}
            >
              <PiMagnifyingGlass className="h-4 w-4" />
            </Button>

            {/* Theme Toggle Button */}
            <ThemeToggle className="h-8.5 w-8.5 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100" />

            {/* Notifications Popover */}
            <Popover>
              <PopoverTrigger className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                <PiBell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
                )}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 p-0 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-100 p-3.5 dark:border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-primary text-[11px] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto dark:divide-zinc-800/60">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors ${
                        n.unread
                          ? 'bg-primary/5 dark:bg-primary/10'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.type === 'success' ? (
                          <PiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : n.type === 'warning' ? (
                          <PiWarningCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        ) : (
                          <PiInfo className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                        )}
                        <div className="flex-1 space-y-0.5">
                          <p className="font-medium text-slate-800 dark:text-zinc-200">{n.title}</p>
                          <p className="text-muted-foreground text-[11px]">{n.desc}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-slate-100 focus:outline-hidden dark:hover:bg-zinc-800">
                <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs">
                  {role.charAt(0).toUpperCase()}
                </div>
                <PiCaretDown className="text-muted-foreground hidden h-3 w-3 sm:block" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs leading-none font-semibold">
                      {userProfile?.username ?? `${role} Account`}
                    </p>
                    <p className="text-muted-foreground text-[11px] leading-none capitalize">
                      {userProfile?.role ?? role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(profileRoute[role])}>
                  <PiUserCircle className="mr-2 h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/auth/change-password')}>
                  <PiKey className="mr-2 h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs">Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/')}>
                  <PiBuildings className="text-primary mr-2 h-3.5 w-3.5" />
                  <span className="text-xs">Public Website</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-rose-600 dark:text-rose-400"
                >
                  <PiSignOut className="mr-2 h-3.5 w-3.5" />
                  <span className="text-xs">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Main Content */}
        <main className="animate-in fade-in-50 mx-auto w-full max-w-7xl flex-1 p-4 duration-200 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
