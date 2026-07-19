import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/shared/hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  ClipboardList,
  Bell,
  LogOut,
  Menu,
  X,
  User,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { name: 'Classes', href: 'classes', icon: ClipboardList },
  { name: 'Subjects', href: 'subjects', icon: BookOpen },
  { name: 'Teachers', href: 'teachers', icon: Users },
  { name: 'Students', href: 'students', icon: GraduationCap },
  { name: 'Exams', href: 'exams', icon: ShieldAlert },
  { name: 'Notice Board', href: 'notices', icon: Bell },
  { name: 'Academic Calendar', href: 'academic', icon: Calendar },
  { name: 'Teacher Attendance', href: 'attendance', icon: ClipboardList },
];

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-muted/20 text-foreground min-h-screen">
      {/* Header */}
      <header className="bg-background sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b px-4 shadow-sm md:px-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <span className="from-primary bg-gradient-to-r to-violet-600 bg-clip-text text-xl font-bold text-transparent">
            School ERP
          </span>
          <span className="bg-primary/10 text-primary hidden items-center rounded-full px-2.5 py-0.5 text-xs font-semibold md:inline-flex">
            Admin Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user ? getInitials(user.username) : 'AD'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm leading-none font-medium">{user?.username}</p>
                  <p className="text-muted-foreground text-xs leading-none">{user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/dashboard')}>
                <User className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="bg-background sticky top-16 hidden min-h-[calc(100vh-4rem)] w-64 space-y-2 border-r p-4 md:block">
          <div className="text-muted-foreground px-3 py-2 text-xs font-semibold tracking-wider uppercase">
            Management
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(`/admin/${item.href}`);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-md'
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Drawer (Framer Motion) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black md:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
              {/* Drawer Container */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-background fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col p-6 shadow-xl md:hidden"
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="from-primary bg-gradient-to-r to-violet-600 bg-clip-text text-xl font-bold text-transparent">
                    School ERP
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <nav className="flex-1 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.includes(`/admin/${item.href}`);
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-primary/20 shadow-md'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-auto border-t pt-4">
                  <Button
                    variant="destructive"
                    className="flex w-full items-center justify-center gap-2"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Outlet */}
        <main className="min-h-[calc(100vh-4rem)] max-w-full flex-1 overflow-hidden p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
