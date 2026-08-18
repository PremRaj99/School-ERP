import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  School,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/shared/common/theme';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="text-foreground flex min-h-screen flex-col bg-slate-50/70 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 dark:bg-zinc-950">
      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <NavLink to="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
              <School className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Aura ERP
                </span>
              </div>
              <p className="text-muted-foreground -mt-0.5 text-[10px]">Enterprise School Portal</p>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `transition-colors ${
                  isActive
                    ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`
              }
            >
              Contact Us
            </NavLink>
            <NavLink
              to="/admin/dashboard"
              className="text-slate-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              Admin Suite
            </NavLink>
            <NavLink
              to="/teacher/dashboard"
              className="text-slate-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              Faculty Hub
            </NavLink>
            <NavLink
              to="/student/dashboard"
              className="text-slate-600 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
            >
              Student Portal
            </NavLink>
          </nav>

          {/* Actions: Theme Toggle & Sign In */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8.5 w-8.5 rounded-full text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </Button>

            <Button
              size="sm"
              onClick={() => navigate('/auth/login')}
              className="hidden bg-linear-to-r from-indigo-600 to-violet-600 font-medium text-white shadow-sm shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 sm:inline-flex"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              <span>Portal Login</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-600 md:hidden dark:text-zinc-400"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="space-y-3 border-b border-slate-200 bg-white/95 px-4 pt-2 pb-5 backdrop-blur-xl md:hidden dark:border-zinc-800 dark:bg-zinc-900/95">
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-zinc-200"
            >
              Home
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-zinc-200"
            >
              Contact Us
            </NavLink>
            <NavLink
              to="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-zinc-200"
            >
              Admin Suite
            </NavLink>
            <NavLink
              to="/teacher/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-zinc-200"
            >
              Faculty Hub
            </NavLink>
            <NavLink
              to="/student/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-800 hover:text-indigo-600 dark:text-zinc-200"
            >
              Student Portal
            </NavLink>
            <div className="pt-2">
              <Button
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/auth/login');
                }}
              >
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                <span>Portal Sign In</span>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
                <School className="h-4 w-4" />
              </div>
              <span className="text-base font-bold tracking-tight">Aura ERP</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Unified educational enterprise management platform empowering administrators,
              teachers, and students.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-900 uppercase dark:text-zinc-100">
              Portals
            </h4>
            <ul className="text-muted-foreground space-y-2 text-xs">
              <li>
                <NavLink to="/admin/dashboard" className="transition-colors hover:text-indigo-600">
                  Administration Suite
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/teacher/dashboard"
                  className="transition-colors hover:text-indigo-600"
                >
                  Teacher Workplace
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/student/dashboard"
                  className="transition-colors hover:text-indigo-600"
                >
                  Student Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/auth/login" className="transition-colors hover:text-indigo-600">
                  Staff & Student Login
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-900 uppercase dark:text-zinc-100">
              Key Features
            </h4>
            <ul className="text-muted-foreground space-y-2 text-xs">
              <li>Digital Attendance & Biometrics</li>
              <li>Exam Schedule & Grade Book</li>
              <li>Automated Fee Invoicing & Receipts</li>
              <li>Academic Timetable Generator</li>
              <li>Instant Emergency Circulars</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold tracking-wider text-slate-900 uppercase dark:text-zinc-100">
              Contact & Support
            </h4>
            <div className="text-muted-foreground space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span>+91 (800) 456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span>support@aura-erp.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span>Education City, Sector 4, New Delhi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs sm:flex-row dark:border-zinc-800">
          <p>© {new Date().getFullYear()} Aura School ERP. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:text-slate-900 dark:hover:text-white">
              Privacy Policy
            </span>
            <span>•</span>
            <span className="cursor-pointer hover:text-slate-900 dark:hover:text-white">
              Terms of Service
            </span>
            <span>•</span>
            <span className="cursor-pointer hover:text-slate-900 dark:hover:text-white">
              Security Compliance
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
