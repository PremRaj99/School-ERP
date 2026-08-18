import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { School, Printer, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export const StudentProfile: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Digital Student ID & Profile</h1>
            <Badge variant="outline" className="border-sky-500/30 text-xs text-sky-600">
              Verified Student
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Institutional credentials, biometric details, emergency contacts, and digital identity
            card.
          </p>
        </div>

        <Button
          onClick={() => toast.success('Sending Digital ID Card to printer...')}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Digital ID Pass</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        {/* Left Column: Digital ID Card Preview */}
        <div className="space-y-4 md:col-span-6">
          <div className="relative space-y-5 overflow-hidden rounded-3xl border border-indigo-500/30 bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-950 p-6 text-white shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute top-0 right-0 -mt-6 -mr-6 h-32 w-32 rounded-full bg-sky-500/20 blur-xl" />

            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                  <School className="h-4 w-4 text-sky-300" />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-tight">AURA INTERNATIONAL ACADEMY</h3>
                  <p className="text-[9px] text-sky-300">Identity Pass 2025-2026</p>
                </div>
              </div>
              <Badge variant="outline" className="border-sky-400/40 text-[9px] text-sky-200">
                STUDENT
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-white/30 bg-linear-to-tr from-sky-500 to-indigo-500 text-2xl font-black text-white shadow-xl">
                AS
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold">Aryan Sharma</h2>
                <p className="text-xs font-semibold text-sky-200">
                  Class 10 - Section A (Roll #101)
                </p>
                <p className="font-mono text-[11px] text-sky-300">ID: STU-2025-001</p>
                <p className="text-[10px] text-indigo-300">Blood Group: O+ • DOB: 12-05-2009</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-white/15 pt-3 text-xs">
              <div>
                <span className="block text-[10px] text-sky-300">Father / Guardian:</span>
                <p className="text-[11px] font-semibold">Rajesh Sharma</p>
              </div>
              <div>
                <span className="block text-[10px] text-sky-300">Emergency Helpline:</span>
                <p className="text-[11px] font-semibold">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/15 pt-1">
              <div className="space-y-0.5">
                <span className="block font-mono text-[9px] text-sky-300">
                  AUTHORIZED CARDHOLDER
                </span>
                <span className="font-mono text-[10px] text-white">VALID: 2025-2026 SESSION</span>
              </div>
              <QrCode className="h-8 w-8 text-white/90" />
            </div>
          </div>
        </div>

        {/* Right Column: Personal & Guardian Details */}
        <div className="space-y-6 md:col-span-6">
          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Student Personal Record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Date of Admission</span>
                  <p className="mt-0.5 font-semibold">01-04-2021</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Aadhar Identifier</span>
                  <p className="mt-0.5 font-mono font-semibold">XXXX-XXXX-8901</p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">
                  Permanent Residential Address
                </span>
                <p className="mt-0.5 font-semibold">
                  B-14, Green Park Extension, New Delhi - 110016
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Parent & Guardian Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Father's Name</span>
                  <p className="mt-0.5 font-semibold">Rajesh Sharma</p>
                  <span className="text-muted-foreground text-[10px]">
                    Occupation: Civil Engineer
                  </span>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Mother's Name</span>
                  <p className="mt-0.5 font-semibold">Sunita Sharma</p>
                  <span className="text-muted-foreground text-[10px]">Occupation: Academician</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
