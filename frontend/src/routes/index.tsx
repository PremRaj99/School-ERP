import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/shared/hooks/useAuth';

// Layouts
import AdminLayout from '@/modules/admin/layouts/AdminLayout';
import StudentLayout from '@/modules/student/layouts/StudentLayout';
import TeacherLayout from '@/modules/teacher/layouts/TeacherLayout';

// Pages
import LoginPage from '@/modules/auth/pages/LoginPage';
import AdminDashboard from '@/modules/admin/pages/Dashboard';
import AdminClasses from '@/modules/admin/pages/Classes';
import AdminSubjects from '@/modules/admin/pages/Subjects';
import AdminTeachers from '@/modules/admin/pages/Teachers';
import AdminStudents from '@/modules/admin/pages/Students';
import AdminExams from '@/modules/admin/pages/Exams';
import AdminNotices from '@/modules/admin/pages/Notices';
import AdminAcademic from '@/modules/admin/pages/Academic';
import AdminAttendance from '@/modules/admin/pages/Attendance';

// Protected Route Guard
import TeacherDashboard from '@/modules/teacher/pages/Dashboard';
import TeacherAttendance from '@/modules/teacher/pages/Attendance';
import TeacherExams from '@/modules/teacher/pages/Exams';
import TeacherResults from '@/modules/teacher/pages/Results';
import TeacherNotices from '@/modules/teacher/pages/Notice';
import TeacherSalary from '@/modules/teacher/pages/Salary';

// Student Pages
import StudentDashboard from '@/modules/student/pages/Dashboard';
import StudentAttendance from '@/modules/student/pages/Attendance';
import StudentSubjects from '@/modules/student/pages/Subjects';
import StudentExams from '@/modules/student/pages/Exams';
import StudentNotices from '@/modules/student/pages/Notice';
import StudentAcademic from '@/modules/student/pages/Academic';
import StudentFees from '@/modules/student/pages/Fees';

function ProtectedRoute({ allowedRoles }: { allowedRoles: ('Admin' | 'Teacher' | 'Student')[] }) {
  const { user, isAuthenticated, isLoading, fetchUser } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-muted-foreground text-sm font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their default dashboard if role not allowed
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return <Outlet />;
}

// Redirect handler for root route "/"
function RootRedirect() {
  const { user, isAuthenticated, isLoading, fetchUser } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Admin Portal Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="teachers" element={<AdminTeachers />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="academic" element={<AdminAcademic />} />
            <Route path="attendance" element={<AdminAttendance />} />
          </Route>
        </Route>

        {/* Student Portal Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Student']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="subjects" element={<StudentSubjects />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="notices" element={<StudentNotices />} />
            <Route path="academic" element={<StudentAcademic />} />
            <Route path="fees" element={<StudentFees />} />
          </Route>
        </Route>

        {/* Teacher Portal Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['Teacher']} />}>
          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="exams" element={<TeacherExams />} />
            <Route path="notices" element={<TeacherNotices />} />
            <Route path="results" element={<TeacherResults />} />
            <Route path="salary" element={<TeacherSalary />} />
          </Route>
        </Route>

        {/* Fallback Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
