import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { authService } from '@/lib/services/auth.service';
import { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { PiKey, PiEye, PiEyeSlash, PiCheck, PiArrowLeft, PiShieldCheck } from 'react-icons/pi';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clear);
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isLengthValid = formData.newPassword.length >= 8;
  const hasNumber = /\d/.test(formData.newPassword);
  const passwordsMatch =
    formData.newPassword.length > 0 && formData.newPassword === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    if (!isLengthValid) {
      toast.error('New password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password updated successfully! Please sign in again.');
      // Changing the password doesn't revoke the current session server-side — clear the local
      // auth state and log out explicitly so the "please sign in again" above is actually true,
      // rather than leaving a stale authenticated session a route guard would still accept.
      try {
        await authService.logout();
      } catch {
        // best-effort — still clearing local state and redirecting below regardless
      }
      clearAuth();
      navigate('/auth/login', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/70 p-4 font-sans dark:bg-zinc-950">
      <Card className="w-full max-w-md border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-md">
              <PiKey className="h-5 w-5" />
            </div>
            <NavLink
              to="/auth/login"
              className="text-muted-foreground hover:text-primary flex items-center gap-1 text-xs"
            >
              <PiArrowLeft className="h-3 w-3" />
              <span>Back to Login</span>
            </NavLink>
          </div>
          <CardTitle className="mt-2 text-xl font-bold">Change Password</CardTitle>
          <CardDescription className="text-xs">
            Update your account password to maintain security.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="oldPassword" className="text-xs font-semibold">
                Current Password <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type={showOld ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-10 pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  {showOld ? <PiEyeSlash className="h-4 w-4" /> : <PiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-semibold">
                New Password <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNew ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="h-10 pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  {showNew ? <PiEyeSlash className="h-4 w-4" /> : <PiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold">
                Confirm New Password <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                className="h-10 text-xs"
              />
            </div>

            {/* Password Requirement Checklist */}
            <div className="space-y-1.5 rounded-md bg-slate-50 p-3 text-xs dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    isLengthValid
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-zinc-700'
                  }`}
                >
                  <PiCheck className="h-2.5 w-2.5" />
                </div>
                <span
                  className={
                    isLengthValid
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  }
                >
                  At least 8 characters long
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    hasNumber
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-zinc-700'
                  }`}
                >
                  <PiCheck className="h-2.5 w-2.5" />
                </div>
                <span
                  className={
                    hasNumber ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                  }
                >
                  Contains at least 1 number
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] ${
                    passwordsMatch
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500 dark:bg-zinc-700'
                  }`}
                >
                  <PiCheck className="h-2.5 w-2.5" />
                </div>
                <span
                  className={
                    passwordsMatch
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  }
                >
                  Passwords match
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="bg-primary h-10 w-full text-xs font-semibold text-white shadow-md hover:opacity-90"
              disabled={loading || !isLengthValid || !passwordsMatch}
            >
              {loading ? (
                'Updating Password...'
              ) : (
                <>
                  <PiShieldCheck className="mr-1.5 h-4 w-4" />
                  <span>Update Password</span>
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
