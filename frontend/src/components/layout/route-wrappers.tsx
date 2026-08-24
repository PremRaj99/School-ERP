import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AppLayout } from './app-layout';
import { PublicLayout } from './public-layout';
import { useAuthStore, roleHomePath } from '@/stores/auth.store';
import { Spinner } from '@/components/ui/spinner';

export const PublicRouteWrapper: React.FC = () => (
  <PublicLayout>
    <Outlet />
  </PublicLayout>
);

const FullPageSpinner: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spinner className="size-6" />
  </div>
);

/**
 * Gates a whole role's route tree on being logged in as that exact role — this is what
 * `PublicRouteWrapper`'s siblings used to be missing entirely (any of `/admin/*`, `/teacher/*`,
 * `/student/*` rendered for anyone, logged in or not; ALIGNMENT_PLAN.md Part 0.5/A1). The
 * underlying API calls were always protected by `verifyJWT` server-side — this closes the gap on
 * the frontend, so an unauthenticated or wrong-role visitor sees a redirect instead of a page that
 * would just fail every request.
 */
const RequireRole: React.FC<{
  role: 'Admin' | 'Teacher' | 'Student' | 'Finance';
  layoutRole: 'admin' | 'teacher' | 'student' | 'finance';
}> = ({ role, layoutRole }) => {
  const { user, status } = useAuthStore();
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'unauthenticated' || !user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?next=${next}`} replace />;
  }

  if (user.role !== role) {
    return <Navigate to={roleHomePath(user.role)} replace />;
  }

  return (
    <AppLayout role={layoutRole}>
      <Outlet />
    </AppLayout>
  );
};

export const AdminRouteWrapper: React.FC = () => <RequireRole role="Admin" layoutRole="admin" />;

export const TeacherRouteWrapper: React.FC = () => (
  <RequireRole role="Teacher" layoutRole="teacher" />
);

export const StudentRouteWrapper: React.FC = () => (
  <RequireRole role="Student" layoutRole="student" />
);

export const FinanceRouteWrapper: React.FC = () => (
  <RequireRole role="Finance" layoutRole="finance" />
);

/** Any authenticated role, no layout — for pages like change-password that every role shares. */
export const RequireAnyAuth: React.FC = () => {
  const { user, status } = useAuthStore();
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'unauthenticated' || !user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?next=${next}`} replace />;
  }

  return <Outlet />;
};
