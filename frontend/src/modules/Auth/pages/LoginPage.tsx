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
  PiGraduationCap,
  PiBuildings,
  PiShieldCheck,
  PiUsers,
  PiWallet,
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
    <div className="selection:bg-primary/20 selection:text-primary flex min-h-screen items-center justify-center bg-slate-50/70 p-4 font-sans sm:p-6 lg:p-8 dark:bg-zinc-950">
      {/* Background Ambient Glow */}
      <div className="bg-primary/10 pointer-events-none fixed top-1/4 left-1/3 -z-10 h-96 w-96 rounded-full blur-3xl" />

      <div className="w-full max-w-md overflow-hidden rounded-md border border-slate-200/80 bg-white p-6 shadow-2xl sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Brand & Logo Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <NavLink to="/" className="group mb-3 flex items-center justify-center">
            <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-md text-white shadow-lg transition-transform duration-200 group-hover:scale-105">
              <PiBuildings className="h-6 w-6" />
            </div>
          </NavLink>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gyan Deep
          </h1>
          <p className="text-muted-foreground text-xs">Baal Vikas Vidya Mandir</p>
          <div className="bg-primary/10 text-primary mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
            <PiShieldCheck className="h-3.5 w-3.5" />
            <span>Portal Sign In</span>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-md border border-slate-200 bg-slate-100 p-1 sm:grid-cols-4 dark:border-zinc-700 dark:bg-zinc-800/80">
          <button
            type="button"
            onClick={() => handleRoleSelect('Admin')}
            className={`flex min-h-10 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              selectedRole === 'Admin'
                ? 'text-primary bg-white shadow-xs dark:bg-zinc-900'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <PiShieldCheck className="h-3.5 w-3.5" />
            <span>Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('Teacher')}
            className={`flex min-h-10 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              selectedRole === 'Teacher'
                ? 'text-primary bg-white shadow-xs dark:bg-zinc-900'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <PiUsers className="h-3.5 w-3.5" />
            <span>Teacher</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('Student')}
            className={`flex min-h-10 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              selectedRole === 'Student'
                ? 'text-primary bg-white shadow-xs dark:bg-zinc-900'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <PiGraduationCap className="h-3.5 w-3.5" />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleSelect('Finance')}
            className={`flex min-h-10 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-semibold transition-all ${
              selectedRole === 'Finance'
                ? 'text-primary bg-white shadow-xs dark:bg-zinc-900'
                : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <PiWallet className="h-3.5 w-3.5" />
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
                {showPassword ? <PiEyeSlash className="h-4 w-4" /> : <PiEye className="h-4 w-4" />}
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
                <span>Sign In as {selectedRole}</span>
                <PiArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

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
  );
};

export default LoginPage;
