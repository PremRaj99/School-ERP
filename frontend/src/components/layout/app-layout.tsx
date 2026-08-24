import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  Bell,
  FileSpreadsheet,
  UserCheck,
  ClipboardCheck,
  Award,
  MessageSquare,
  Search,
  Sun,
  Moon,
  LogOut,
  KeyRound,
  Menu,
  X,
  ChevronDown,
  School,
  CheckCircle2,
  AlertCircle,
  Info,
  UserCircle2,
  Settings,
  BarChart3,
} from 'lucide-react';
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
import { useTheme } from '@/shared/common/theme';
import { useAuthStore } from '@/stores/auth.store';
import { CommandMenu } from './command-menu';
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
      { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'People',
    items: [
      { title: 'Students', href: '/admin/students', icon: GraduationCap },
      { title: 'Teachers', href: '/admin/teachers', icon: Users },
      { title: 'Teacher Attendance', href: '/admin/attendance', icon: UserCheck },
      { title: 'Student Attendance', href: '/admin/attendance/student', icon: ClipboardCheck },
    ],
  },
  {
    title: 'Academics',
    items: [
      { title: 'Classes & Sections', href: '/admin/classes', icon: BookOpen },
      { title: 'Subjects', href: '/admin/subjects', icon: BookOpen },
      { title: 'Exams & Results', href: '/admin/exams', icon: Award },
      { title: 'Timetable & Calendar', href: '/admin/academic', icon: Calendar },
    ],
  },
  {
    title: 'Administration',
    items: [
      { title: 'Finance & Fees', href: '/admin/finance', icon: CreditCard },
      { title: 'Notices & Circulars', href: '/admin/notices', icon: Bell },
      { title: 'Inquiries', href: '/admin/contact', icon: MessageSquare },
      { title: 'Account Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

const teacherNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Teacher Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
      { title: 'Analytics', href: '/teacher/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Classroom',
    items: [
      { title: 'My Timetable', href: '/teacher/timetable', icon: Calendar },
      { title: 'Mark Attendance', href: '/teacher/attendance', icon: UserCheck },
      { title: 'Grading & Marks', href: '/teacher/results', icon: FileSpreadsheet },
      { title: 'Exam Schedules', href: '/teacher/exams', icon: Award },
    ],
  },
  {
    title: 'Personal',
    items: [
      { title: 'School Notices', href: '/teacher/notices', icon: Bell },
      { title: 'Salary Slips', href: '/teacher/salary', icon: CreditCard },
      { title: 'My Profile', href: '/teacher/profile', icon: Users },
    ],
  },
];

const studentNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Student Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { title: 'Analytics', href: '/student/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Academics',
    items: [
      { title: 'My Attendance', href: '/student/attendance', icon: UserCheck },
      { title: 'Subjects & Syllabus', href: '/student/subjects', icon: BookOpen },
      { title: 'Exams & Reports', href: '/student/exams', icon: Award },
      { title: 'Timetable & Events', href: '/student/academic', icon: Calendar },
    ],
  },
  {
    title: 'Accounts & Info',
    items: [
      { title: 'Fees & Invoices', href: '/student/fees', icon: CreditCard },
      { title: 'Notice Board', href: '/student/notices', icon: Bell },
      { title: 'Digital ID & Profile', href: '/student/profile', icon: GraduationCap },
    ],
  },
];

const financeNavSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Finance Dashboard', href: '/finance/dashboard', icon: LayoutDashboard },
      { title: 'Analytics', href: '/finance/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Ledger',
    items: [
      { title: 'Student Fees', href: '/finance/fees', icon: GraduationCap },
      { title: 'Teacher Salaries', href: '/finance/salaries', icon: Users },
      { title: 'Expenses', href: '/finance/expenses', icon: CreditCard },
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
  const { resolvedTheme, setTheme } = useTheme();
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

  const roleLabels: Record<string, { label: string; badgeClass: string; avatarBg: string }> = {
    admin: {
      label: 'Admin Portal',
      badgeClass:
        'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-medium',
      avatarBg: 'from-indigo-600 to-violet-600',
    },
    teacher: {
      label: 'Faculty Portal',
      badgeClass:
        'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-medium',
      avatarBg: 'from-emerald-600 to-teal-600',
    },
    student: {
      label: 'Student Portal',
      badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30 font-medium',
      avatarBg: 'from-sky-600 to-blue-600',
    },
    finance: {
      label: 'Finance Portal',
      badgeClass:
        'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-medium',
      avatarBg: 'from-amber-600 to-orange-600',
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
        <div className="flex h-16 items-center justify-between border-b border-slate-200/70 px-5 dark:border-zinc-800/80">
          <NavLink to={`/${role}/dashboard`} className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
              <School className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Aura ERP
                </span>
                <Badge variant="outline" className="h-4 px-1.5 py-0 text-[10px] font-medium">
                  PRO
                </Badge>
              </div>
              <p className="text-muted-foreground -mt-0.5 text-[11px]">School Management</p>
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
                    className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-50 font-semibold text-indigo-600 shadow-xs dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 group-hover:text-slate-700 dark:text-zinc-500 dark:group-hover:text-zinc-300'
                        }`}
                      />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="h-4.5 bg-indigo-100 px-1.5 text-[10px] text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
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
              <div
                className={`h-8 w-8 rounded-full bg-linear-to-tr ${currentRoleConfig.avatarBg} flex items-center justify-center text-xs font-bold text-white shadow-xs`}
              >
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
              <LogOut className="h-3.5 w-3.5" />
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-xs transition-transform group-hover:scale-105">
                  <School className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold">Aura ERP</span>
              </NavLink>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
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
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        <Icon className="h-4 w-4 text-indigo-500" />
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
              <Menu className="h-5 w-5" />
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
              <Search className="h-3.5 w-3.5" />
              <span>Search modules, commands...</span>
              <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] shadow-2xs dark:border-zinc-700 dark:bg-zinc-900">
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
              <Search className="h-4 w-4" />
            </Button>

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8.5 w-8.5 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              title="Toggle Theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600 transition-transform hover:-rotate-12" />
              )}
            </Button>

            {/* Notifications Popover */}
            <Popover>
              <PopoverTrigger className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
                <Bell className="h-4 w-4" />
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
                      className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400"
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
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {n.type === 'success' ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : n.type === 'warning' ? (
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        ) : (
                          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
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
                <div
                  className={`h-7 w-7 rounded-full bg-linear-to-tr ${currentRoleConfig.avatarBg} flex items-center justify-center text-xs font-bold text-white shadow-xs`}
                >
                  {role.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className="text-muted-foreground hidden h-3 w-3 sm:block" />
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
                  <UserCircle2 className="mr-2 h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/auth/change-password')}>
                  <KeyRound className="mr-2 h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs">Change Password</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/')}>
                  <School className="mr-2 h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs">Public Website</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-rose-600 dark:text-rose-400"
                >
                  <LogOut className="mr-2 h-3.5 w-3.5" />
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
