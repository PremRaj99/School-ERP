import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/api';
import { authService } from '@/lib/services/auth.service';
import { roleHomePath, useAuthStore } from '@/stores/auth.store';
import {
  PiArrowLeft,
  PiArrowRight,
  PiEye,
  PiEyeSlash,
  PiBuildings,
  PiShieldCheck,
  PiCheckCircle,
  PiSparkle,
} from 'react-icons/pi';
import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(formData);
      setUser(response.user);
      toast.success('Login successful! Welcome back.');
      const next = searchParams.get('next');
      const home = roleHomePath(response.user.role);
      const destination =
        next && next.startsWith(`/${response.user.role.toLowerCase()}`) ? next : home;
      navigate(destination, { replace: true });
    } catch (err) {
      const errMsg = getErrorMessage(err);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="selection:bg-primary/20 selection:text-primary flex min-h-screen items-center justify-center bg-slate-50/70 p-4 font-sans sm:p-6 lg:p-8 dark:bg-zinc-950">
      {/* Background Ambient Glow */}
      <div className="bg-primary/10 pointer-events-none fixed top-1/4 left-1/3 -z-10 h-96 w-96 rounded-full blur-3xl" />

      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xl md:max-w-4xl dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left Visual Illustration Column (Desktop only) */}
          <div className="border-primary/10 bg-primary/5 hidden flex-col justify-between p-6 sm:p-8 md:col-span-5 md:flex md:border-r dark:border-zinc-800 dark:bg-zinc-950/60">
            <div>
              {/* Brand Header */}
              <NavLink to="/" className="group mb-6 inline-flex items-center gap-2.5">
                <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-md transition-transform duration-200 group-hover:scale-105">
                  <PiBuildings className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                    Gyandeep
                  </h1>
                  <p className="text-muted-foreground text-[11px]">Baal Vikas vidyamandir</p>
                </div>
              </NavLink>

              {/* Illustration Showcase */}
              <div className="my-4 flex flex-col items-center justify-center text-center">
                <div className="relative mx-auto flex h-48 w-48 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <img
                    src="/auth-illustration.jpg"
                    alt="Access Granted Door & Key Illustration"
                    className="h-full w-full object-contain dark:hue-rotate-180 dark:invert"
                  />
                </div>

                <div className="mt-4 space-y-1">
                  <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
                    <PiSparkle className="h-3.5 w-3.5" />
                    <span>Secure Gateway</span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Unified Campus Access
                  </h2>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Fast, synchronized access for administrators, faculty, students, and finance.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Feature Checklist */}
            <div className="mt-6 space-y-2 border-t border-slate-200/60 pt-4 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                <PiCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Role-based permissions & audit trails</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-400">
                <PiCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>Instant session verification</span>
              </div>
            </div>
          </div>

          {/* Right Form Column - Vertically Centered */}
          <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-7 md:p-10">
            {/* Mobile Brand Header */}
            <div className="mb-6 flex items-center justify-between md:hidden">
              <NavLink to="/" className="inline-flex items-center gap-2.5">
                <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg text-white shadow-sm">
                  <PiBuildings className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900 dark:text-white">Gyandeep</h1>
                  <p className="text-muted-foreground text-[10px]">Baal Vikas vidyamandir</p>
                </div>
              </NavLink>
              <Badge variant="outline" className="text-[10px]">
                ERP v2.0
              </Badge>
            </div>

            <div className="my-auto py-2">
              {/* Form Title */}
              <div className="mb-6">
                <div className="hidden items-center justify-between md:flex">
                  <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
                    <PiShieldCheck className="h-3.5 w-3.5" />
                    <span>Portal Sign In</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] text-slate-500 dark:text-zinc-400"
                  >
                    ERP v2.0
                  </Badge>
                </div>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome to Gyandeep
                </h3>
                <p className="text-muted-foreground text-xs">
                  Enter your portal credentials to proceed.
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-semibold">
                    Username / ID
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="e.g. admin, TCH00000001, STU00000001"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold">
                      Password
                    </Label>
                    <NavLink
                      to="/auth/change-password"
                      className="text-primary text-[11px] hover:underline"
                    >
                      Change Password?
                    </NavLink>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="h-10 pr-10 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                    >
                      {showPassword ? (
                        <PiEyeSlash className="h-4 w-4" />
                      ) : (
                        <PiEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-primary h-10 w-full rounded-md text-xs font-semibold text-white shadow-md hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? (
                    'Verifying Credentials...'
                  ) : (
                    <>
                      <span>Sign In to Portal</span>
                      <PiArrowRight className="ml-1.5 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Back Link */}
            <div className="mt-6 border-t border-slate-100 pt-4 text-center dark:border-zinc-800">
              <NavLink
                to="/"
                className="text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 text-xs transition-colors"
              >
                <PiArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Public Website</span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
