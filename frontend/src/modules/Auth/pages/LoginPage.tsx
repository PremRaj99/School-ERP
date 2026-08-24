import React, { useState } from 'react';
import { useNavigate, useSearchParams, NavLink } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/services/auth.service';
import { getErrorMessage } from '@/lib/api';
import { useAuthStore, roleHomePath } from '@/stores/auth.store';
import { toast } from 'sonner';
import {
  School,
  ShieldCheck,
  Users,
  GraduationCap,
  Wallet,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

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

      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl lg:grid-cols-12 dark:border-zinc-800 dark:bg-zinc-900">
        {/* Left Side Banner */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 text-white lg:col-span-5">
          <div className="pointer-events-none absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-indigo-500/20 blur-2xl" />

          <div className="relative z-10 space-y-6">
            <NavLink to="/" className="group inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-xs">
                <School className="h-5 w-5 text-indigo-300" />
              </div>
              <span className="text-base font-bold tracking-tight">Aura School ERP</span>
            </NavLink>

            <div className="space-y-2 pt-4">
              <Badge variant="outline" className="border-indigo-400/30 text-[10px] text-indigo-300">
                Single Sign-On Portal
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back to your educational hub
              </h2>
              <p className="text-xs leading-relaxed text-indigo-200">
                Seamlessly access attendance rosters, real-time fee ledgers, exam grade sheets, and
                institutional notices.
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-8 space-y-3 border-t border-white/10 pt-8">
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Role-Based Access Control</span>
            </div>
          </div>
        </div>

        {/* Right Side Login Form */}
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Portal Sign In</h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Choose your role and enter credentials
              </p>
            </div>
            <NavLink
              to="/"
              className="text-muted-foreground flex items-center gap-1 text-xs hover:text-indigo-600"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Home</span>
            </NavLink>
          </div>

          {/* Role Switcher Tabs */}
          <div className="mb-5 grid grid-cols-4 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
            <button
              type="button"
              onClick={() => handleRoleSelect('Admin')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
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
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
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
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
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
              className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                selectedRole === 'Finance'
                  ? 'bg-white text-amber-600 shadow-xs dark:bg-zinc-900 dark:text-amber-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Wallet className="h-3.5 w-3.5" />
              <span>Finance</span>
            </button>
          </div>

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
              className="h-10 w-full bg-indigo-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
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
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
