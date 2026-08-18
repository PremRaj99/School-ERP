import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { teacherService } from '@/lib/services/teacher.service';
import { authService } from '@/lib/services/auth.service';
import type { Teacher } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const TeacherProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    teacherService
      .getProfile()
      .then((res) => {
        setProfile(res.data);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.changePassword(formData);
      toast.success(res.message || 'Password changed successfully!');
      setFormData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSession = async () => {
    setLoading(true);
    try {
      const res = await authService.refresh();
      toast.success(res.message || 'Session tokens refreshed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      navigate('/auth/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teacher Profile & Settings</h1>
        <p className="text-muted-foreground text-xs">
          {profile
            ? `Logged in as ${profile.firstName} ${profile.lastName || ''} (Teacher ID: ${profile.teacherId})`
            : 'Manage your account credentials and security settings.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Change Account Password</CardTitle>
            <CardDescription>
              Enter your existing password and choose a secure new one.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="8-15 chars (upper, lower, digit, special)"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session & Security</CardTitle>
            <CardDescription>Active session management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-xs">
              Sign out from this device to invalidate your session tokens.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={handleRefreshSession}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Refresh Session
            </Button>
            <Button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              variant="destructive"
              className="w-full"
            >
              Log Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TeacherProfile;
