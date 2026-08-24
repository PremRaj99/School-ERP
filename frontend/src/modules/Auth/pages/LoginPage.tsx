import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getErrorMessage } from '@/lib/api';
import { authService } from '@/lib/services/auth.service';
import { roleHomePath, useAuthStore } from '@/stores/auth.store';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  School,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';
import React, { useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'Teacher' | 'Student' | 'Finance'>(
    'Admin',
  );
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleSelect = (role: 'Admin' | 'Teacher' | 'Student' | 'Finance') => {
    setSelectedRole(role);
    // Just switches which tab is highlighted — credentials are always typed in, never
    // pre-filled. The old version auto-filled `admin`/`password123` per role, which was never a
    // real account (the seeded password is `admin123`, and the field cleared on every switch
    // anyway) — dropped rather than fixed with the real seed credentials, since hardcoding a
    // working password into a page anyone can load isn't something to reintroduce deliberately.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(formData);
      setUser(response.user);
      toast.success('Login successful! Welcome back.');
      // `next` is only honored if it actually belongs to the role that just logged in — otherwise
      // the route guard would immediately bounce them straight back out again.
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70 p-4 font-sans selection:bg-indigo-500/20 selection:text-indigo-600 sm:p-6 lg:p-8 dark:bg-zinc-950">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed top-1/4 left-1/3 -z-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none fixed right-1/3 bottom-1/4 -z-10 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Brand & Logo Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <NavLink to="/" className="group mb-3 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
              <School className="h-6 w-6" />
            </div>
          </NavLink>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gyan Deep BVM
          </h1>
          <p className="text-muted-foreground text-xs">Baal Vikas Vidya Mandir</p>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Portal Sign In</span>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="mb-5 grid grid-cols-4 gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <button
            type="button"
            onClick={() => handleRoleSelect('Admin')}
            className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              selectedRole === 'Admin'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-zinc-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('Teacher')}
            className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              selectedRole === 'Teacher'
                ? 'bg-white text-emerald-600 shadow-xs dark:bg-zinc-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Teacher</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('Student')}
            className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              selectedRole === 'Student'
                ? 'bg-white text-sky-600 shadow-xs dark:bg-zinc-900 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('Finance')}
            className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              selectedRole === 'Finance'
                ? 'bg-white text-amber-600 shadow-xs dark:bg-zinc-900 dark:text-amber-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>Finance</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold">
              Username / Identifier
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Enter username"
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
                className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400"
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
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-10 w-full rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
            disabled={loading}
          >
            {loading ? (
              'Verifying Credentials...'
            ) : (
              <>
                <span>Sign In as {selectedRole}</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Back Link */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center dark:border-zinc-800">
          <NavLink
            to="/"
            className="text-muted-foreground inline-flex items-center gap-1.5 text-xs transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Public Website</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
