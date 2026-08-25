import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { PiBuildings, PiArrowRight, PiPhone, PiEnvelopeSimple, PiMapPin } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="text-foreground selection:bg-primary/20 selection:text-primary flex min-h-screen flex-col bg-slate-50/70 font-sans dark:bg-zinc-950">
      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <NavLink to="/" className="group flex items-center gap-2.5">
            <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white shadow-md transition-transform duration-200 group-hover:scale-105">
              <PiBuildings className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Gyandeep
                </span>
              </div>
              <p className="text-muted-foreground -mt-0.5 text-[10px]">Baal Vikas vidyamandir</p>
            </div>
          </NavLink>

          {/* Actions: Theme Toggle & Sign In */}
          <div className="flex items-center gap-3">
            <ThemeToggle className="h-8.5 w-8.5 rounded-full text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100" />

            <Button
              onClick={() => navigate('/auth/login')}
              className="bg-primary inline-flex py-4 font-medium text-white shadow-sm hover:opacity-90"
            >
              <span>Login</span>
              <PiArrowRight className="h-3.5 w-3.5" />
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
              <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-md font-bold text-white">
                <PiBuildings className="h-4 w-4" />
              </div>
              <span className="text-base font-bold tracking-tight">Gyandeep</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Gyandeep Baal Vikas vidyamandir — Unified educational enterprise management platform.
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
                <PiPhone className="text-primary h-3.5 w-3.5 shrink-0" />
                <span>+91 6200103129</span>
              </div>
              <div className="flex items-center gap-2">
                <PiEnvelopeSimple className="text-primary h-3.5 w-3.5 shrink-0" />
                <span>web.premraj@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <PiMapPin className="text-primary h-3.5 w-3.5 shrink-0" />
                <span>Naya Savera Parivar Office, Duhatand, Dhanbad, Jharkhand, 826001</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-muted-foreground mx-auto mt-8 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs sm:flex-row dark:border-zinc-800">
          <p>© {new Date().getFullYear()} Gyandeep Baal Vikas vidyamandir. All rights reserved.</p>
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
