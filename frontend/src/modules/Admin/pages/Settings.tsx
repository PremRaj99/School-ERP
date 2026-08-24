import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { authService } from '@/lib/services/auth.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { KeyRound, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clear);

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.user.profile(),
    queryFn: () => authService.getUser(),
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore — still clear local state below
    } finally {
      clearAuth();
      toast.success('Logged out successfully');
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-2 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Your login identity and account security options.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-52 w-full max-w-xl" />
      ) : isError ? (
        <ErrorState
          description={getErrorMessage(error)}
          onRetry={() => refetch()}
          className="max-w-xl"
        />
      ) : (
        <Card className="max-w-xl border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-indigo-600 to-violet-600 text-lg font-bold text-white">
                {profile?.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <UserCircle2 className="h-4 w-4 text-indigo-500" />
                  {profile?.username}
                </CardTitle>
                <CardDescription className="text-xs">
                  <Badge variant="outline" className="text-[10px] font-medium">
                    {profile?.role}
                  </Badge>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="font-semibold">Password</p>
                  <p className="text-muted-foreground text-[11px]">Update your login password.</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => navigate('/auth/change-password')}
              >
                <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-xs dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4 text-rose-500" />
                <div>
                  <p className="font-semibold">Sign Out</p>
                  <p className="text-muted-foreground text-[11px]">
                    End your session on this device.
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="h-8 text-xs"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSettings;
