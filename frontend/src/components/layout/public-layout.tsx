import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { School, Sun, Moon, ArrowRight, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/shared/common/theme';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();

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
              className="inline-flex bg-linear-to-r from-indigo-600 to-violet-600 font-medium text-white shadow-sm shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700"
            >
              <ShieldCheck className="mr-1.5 h-4 w-4" />
              <span>Portal Login</span>
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">{children}</main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
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
