import { createBrowserRouter } from 'react-router-dom';
import {
  PublicRouteWrapper,
  AdminRouteWrapper,
  TeacherRouteWrapper,
  StudentRouteWrapper,
  FinanceRouteWrapper,
  RequireAnyAuth,
} from '@/components/layout/route-wrappers';

// Public / Home / Contact / Auth
import HomePage from '@/modules/Home/pages/HomePage';
import ContactPage from '@/modules/Contact/pages/ContactPage';
import LoginPage from '@/modules/Auth/pages/LoginPage';
import ChangePasswordPage from '@/modules/Auth/pages/ChangePasswordPage';

// Admin Module Pages
import AdminDashboard from '@/modules/Admin/pages/Dashboard';
import AdminAnalytics from '@/modules/Admin/pages/Analytics';
import AdminStudents from '@/modules/Admin/pages/Students';
import AdminTeachers from '@/modules/Admin/pages/Teachers';
import AdminClasses from '@/modules/Admin/pages/Classes';
import AdminSubjects from '@/modules/Admin/pages/Subjects';
import AdminExams from '@/modules/Admin/pages/Exams';
import AdminNotices from '@/modules/Admin/pages/Notices';
import AdminAcademic from '@/modules/Admin/pages/Academic';
import AdminFinance from '@/modules/Admin/pages/Finance';
import AdminContactMessages from '@/modules/Admin/pages/ContactMessages';
import AdminAttendance from '@/modules/Admin/pages/Attendance';
import AdminStudentAttendance from '@/modules/Admin/pages/StudentAttendance';
import AdminStudentDetail from '@/modules/Admin/pages/StudentDetail';
import AdminTeacherDetail from '@/modules/Admin/pages/TeacherDetail';
import AdminClassDetail from '@/modules/Admin/pages/ClassDetail';
import AdminExamDetail from '@/modules/Admin/pages/ExamDetail';
import AdminSettings from '@/modules/Admin/pages/Settings';

// Student Module Pages
import StudentDashboard from '@/modules/Student/pages/Dashboard';
import StudentAnalytics from '@/modules/Student/pages/Analytics';
import StudentAttendance from '@/modules/Student/pages/Attendance';
import StudentSubjects from '@/modules/Student/pages/Subjects';
import StudentExams from '@/modules/Student/pages/Exams';
import StudentNotices from '@/modules/Student/pages/Notices';
import StudentAcademic from '@/modules/Student/pages/Academic';
import StudentFees from '@/modules/Student/pages/Fees';
import StudentProfile from '@/modules/Student/pages/Profile';
import StudentResultDetail from '@/modules/Student/pages/ResultDetail';

// Teacher Module Pages
import TeacherDashboard from '@/modules/Teacher/pages/Dashboard';
import TeacherAnalytics from '@/modules/Teacher/pages/Analytics';
import TeacherAttendance from '@/modules/Teacher/pages/Attendance';
import TeacherTimetable from '@/modules/Teacher/pages/Timetable';
import TeacherExams from '@/modules/Teacher/pages/Exams';
import TeacherResults from '@/modules/Teacher/pages/Results';
import TeacherNotices from '@/modules/Teacher/pages/Notices';
import TeacherSalary from '@/modules/Teacher/pages/Salary';
import TeacherProfile from '@/modules/Teacher/pages/Profile';

// Finance Module Pages
import FinanceDashboard from '@/modules/Finance/pages/Dashboard';
import FinanceAnalytics from '@/modules/Finance/pages/Analytics';
import FinanceFees from '@/modules/Finance/pages/Fees';
import FinanceSalaries from '@/modules/Finance/pages/Salaries';
import FinanceExpenses from '@/modules/Finance/pages/Expenses';

export const router = createBrowserRouter([
  // Public Pages (Home, Contact)
  {
    path: '/',
    element: <PublicRouteWrapper />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'contact', element: <ContactPage /> },
    ],
  },

  // Auth Pages
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/change-password',
    element: <RequireAnyAuth />,
    children: [{ path: '', element: <ChangePasswordPage /> }],
  },

  // Admin Portal Routes
  {
    path: '/admin',
    element: <AdminRouteWrapper />,
    children: [
      { path: '', element: <AdminDashboard /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'students', element: <AdminStudents /> },
      { path: 'students/:studentId', element: <AdminStudentDetail /> },
      { path: 'teachers', element: <AdminTeachers /> },
      { path: 'teachers/:teacherId', element: <AdminTeacherDetail /> },
      { path: 'classes', element: <AdminClasses /> },
      { path: 'classes/:classId', element: <AdminClassDetail /> },
      { path: 'subjects', element: <AdminSubjects /> },
      { path: 'exams', element: <AdminExams /> },
      { path: 'exams/:examId', element: <AdminExamDetail /> },
      { path: 'notices', element: <AdminNotices /> },
      { path: 'academic', element: <AdminAcademic /> },
      { path: 'finance', element: <AdminFinance /> },
      { path: 'contact', element: <AdminContactMessages /> },
      { path: 'attendance', element: <AdminAttendance /> },
      { path: 'attendance/student', element: <AdminStudentAttendance /> },
      { path: 'settings', element: <AdminSettings /> },
    ],
  },

  // Teacher Portal Routes
  {
    path: '/teacher',
    element: <TeacherRouteWrapper />,
    children: [
      { path: '', element: <TeacherDashboard /> },
      { path: 'dashboard', element: <TeacherDashboard /> },
      { path: 'analytics', element: <TeacherAnalytics /> },
      { path: 'attendance', element: <TeacherAttendance /> },
      { path: 'timetable', element: <TeacherTimetable /> },
      { path: 'exams', element: <TeacherExams /> },
      { path: 'results', element: <TeacherResults /> },
      { path: 'notices', element: <TeacherNotices /> },
      { path: 'salary', element: <TeacherSalary /> },
      { path: 'profile', element: <TeacherProfile /> },
    ],
  },

  // Student Portal Routes
  {
    path: '/student',
    element: <StudentRouteWrapper />,
    children: [
      { path: '', element: <StudentDashboard /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'analytics', element: <StudentAnalytics /> },
      { path: 'attendance', element: <StudentAttendance /> },
      { path: 'subjects', element: <StudentSubjects /> },
      { path: 'exams', element: <StudentExams /> },
      { path: 'exams/:examId/result', element: <StudentResultDetail /> },
      { path: 'notices', element: <StudentNotices /> },
      { path: 'academic', element: <StudentAcademic /> },
      { path: 'fees', element: <StudentFees /> },
      { path: 'profile', element: <StudentProfile /> },
    ],
  },

  // Finance Portal Routes (ALIGNMENT_PLAN.md P4)
  {
    path: '/finance',
    element: <FinanceRouteWrapper />,
    children: [
      { path: '', element: <FinanceDashboard /> },
      { path: 'dashboard', element: <FinanceDashboard /> },
      { path: 'analytics', element: <FinanceAnalytics /> },
      { path: 'fees', element: <FinanceFees /> },
      { path: 'salaries', element: <FinanceSalaries /> },
      { path: 'expenses', element: <FinanceExpenses /> },
    ],
  },
]);

export default router;
