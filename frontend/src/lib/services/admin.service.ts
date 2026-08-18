import { apiClient, type ApiResponse } from '../api';
import type {
  Student,
  StudentPayload,
  Teacher,
  TeacherPayload,
  ClassItem,
  CreateClassPayload,
  SubjectItem,
  CreateSubjectPayload,
  UpdateSubjectPayload,
  Exam,
  CreateExamPayload,
  Notice,
  CreateNoticePayload,
  TimeTableSlot,
  UpdateTimetableSlotPayload,
  CalendarEvent,
  CreateCalendarEventPayload,
  StudentFee,
  CreateStudentFeePayload,
  TeacherSalary,
  CreateTeacherSalaryPayload,
  Transaction,
  CreateTransactionPayload,
  ContactMessage,
  AttendanceRecord,
  AdminDashboardData,
} from '../types';

export const adminService = {
  // Dashboard
  getDashboard: async () => {
    const res = await apiClient.get<ApiResponse<AdminDashboardData>>('/admin/dashboard');
    return res.data;
  },

  // Students
  getStudents: async () => {
    const res = await apiClient.get<ApiResponse<Student[]>>('/admin/student');
    return res.data;
  },
  getStudentById: async (studentId: string) => {
    const res = await apiClient.get<ApiResponse<Student>>(`/admin/student/${studentId}`);
    return res.data;
  },
  createStudent: async (payload: Partial<StudentPayload> | Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<Student>>('/admin/student', payload);
    return res.data;
  },
  updateStudent: async (
    studentId: string,
    payload: Partial<StudentPayload> | Record<string, unknown>,
  ) => {
    const res = await apiClient.put<ApiResponse<Student>>(`/admin/student/${studentId}`, payload);
    return res.data;
  },
  deleteStudent: async (studentId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/student/${studentId}`,
    );
    return res.data;
  },

  // Teachers
  getTeachers: async () => {
    const res = await apiClient.get<ApiResponse<Teacher[]>>('/admin/teacher');
    return res.data;
  },
  getTeacherById: async (teacherId: string) => {
    const res = await apiClient.get<ApiResponse<Teacher>>(`/admin/teacher/${teacherId}`);
    return res.data;
  },
  createTeacher: async (payload: Partial<TeacherPayload> | Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<Teacher>>('/admin/teacher', payload);
    return res.data;
  },
  updateTeacher: async (
    teacherId: string,
    payload: Partial<TeacherPayload> | Record<string, unknown>,
  ) => {
    const res = await apiClient.put<ApiResponse<Teacher>>(`/admin/teacher/${teacherId}`, payload);
    return res.data;
  },
  deleteTeacher: async (teacherId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/teacher/${teacherId}`,
    );
    return res.data;
  },

  // Classes
  getClasses: async () => {
    const res = await apiClient.get<ApiResponse<ClassItem[]>>('/admin/class');
    return res.data;
  },
  createClass: async (payload: CreateClassPayload) => {
    const res = await apiClient.post<ApiResponse<ClassItem>>('/admin/class', payload);
    return res.data;
  },
  deleteClass: async (classId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/admin/class/${classId}`);
    return res.data;
  },

  // Subjects
  getSubjects: async () => {
    const res = await apiClient.get<ApiResponse<SubjectItem[]>>('/admin/subject');
    return res.data;
  },
  getAllClassSubjects: async () => {
    const res = await apiClient.get<ApiResponse<unknown>>('/admin/subject/get-all-class-subject');
    return res.data;
  },
  createSubject: async (payload: CreateSubjectPayload) => {
    const res = await apiClient.post<ApiResponse<SubjectItem>>('/admin/subject', payload);
    return res.data;
  },
  updateSubject: async (subjectCode: string, payload: UpdateSubjectPayload) => {
    const res = await apiClient.put<ApiResponse<SubjectItem>>(
      `/admin/subject/${subjectCode}`,
      payload,
    );
    return res.data;
  },
  deleteSubject: async (subjectCode: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/subject/${subjectCode}`,
    );
    return res.data;
  },

  // Exams
  getExams: async () => {
    const res = await apiClient.get<ApiResponse<Exam[]>>('/admin/exam');
    return res.data;
  },
  createExam: async (payload: CreateExamPayload | Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<Exam>>('/admin/exam', payload);
    return res.data;
  },
  deleteExam: async (examId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(`/admin/exam/${examId}`);
    return res.data;
  },
  declareResult: async (examId: string, isResultDecleared: boolean) => {
    const res = await apiClient.put<ApiResponse<Exam>>(`/admin/exam/${examId}/declare-result`, {
      isResultDecleared,
    });
    return res.data;
  },

  // Notices
  getNotices: async () => {
    const res = await apiClient.get<ApiResponse<Notice[]>>('/admin/notice');
    return res.data;
  },
  getNoticeById: async (noticeId: string) => {
    const res = await apiClient.get<ApiResponse<Notice>>(`/admin/notice/${noticeId}`);
    return res.data;
  },
  createNotice: async (payload: CreateNoticePayload | Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<Notice>>('/admin/notice', payload);
    return res.data;
  },
  deleteNotice: async (noticeId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/notice/${noticeId}`,
    );
    return res.data;
  },

  // Academic (Timetable & Calendar)
  getTimetable: async () => {
    const res = await apiClient.get<ApiResponse<TimeTableSlot[]>>('/admin/academic/time-table');
    return res.data;
  },
  updateTimetableSlot: async (payload: UpdateTimetableSlotPayload | Record<string, unknown>) => {
    const res = await apiClient.put<ApiResponse<TimeTableSlot>>(
      '/admin/academic/time-table',
      payload,
    );
    return res.data;
  },
  getCalendar: async () => {
    const res = await apiClient.get<ApiResponse<CalendarEvent[]>>('/admin/academic/calendar');
    return res.data;
  },
  createCalendarEvent: async (payload: CreateCalendarEventPayload) => {
    const res = await apiClient.post<ApiResponse<CalendarEvent>>(
      '/admin/academic/calendar',
      payload,
    );
    return res.data;
  },
  deleteCalendarEvent: async (calendarId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/academic/calendar/${calendarId}`,
    );
    return res.data;
  },

  // Finance
  getStudentFees: async (params?: Record<string, string>) => {
    const res = await apiClient.get<ApiResponse<StudentFee[]>>('/admin/finance/student-fee', {
      params,
    });
    return res.data;
  },
  getStudentFeeById: async (feeId: string) => {
    const res = await apiClient.get<ApiResponse<StudentFee>>(`/admin/finance/student-fee/${feeId}`);
    return res.data;
  },
  createStudentFee: async (payload: CreateStudentFeePayload | Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<StudentFee>>(
      '/admin/finance/student-fee',
      payload,
    );
    return res.data;
  },
  updateStudentFeeStatus: async (feeId: string, status: string) => {
    const res = await apiClient.put<ApiResponse<StudentFee>>(
      `/admin/finance/student-fee/${feeId}/status`,
      { status },
    );
    return res.data;
  },
  deleteStudentFee: async (feeId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/finance/student-fee/${feeId}`,
    );
    return res.data;
  },

  getTeacherSalaries: async (params?: Record<string, string>) => {
    const res = await apiClient.get<ApiResponse<TeacherSalary[]>>('/admin/finance/teacher-salary', {
      params,
    });
    return res.data;
  },
  getTeacherSalaryById: async (salaryId: string) => {
    const res = await apiClient.get<ApiResponse<TeacherSalary>>(
      `/admin/finance/teacher-salary/${salaryId}`,
    );
    return res.data;
  },
  createTeacherSalary: async (payload: CreateTeacherSalaryPayload | Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<TeacherSalary>>(
      '/admin/finance/teacher-salary',
      payload,
    );
    return res.data;
  },
  updateTeacherSalaryStatus: async (salaryId: string, status: string) => {
    const res = await apiClient.put<ApiResponse<TeacherSalary>>(
      `/admin/finance/teacher-salary/${salaryId}/status`,
      { status },
    );
    return res.data;
  },
  deleteTeacherSalary: async (salaryId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/finance/teacher-salary/${salaryId}`,
    );
    return res.data;
  },

  getTransactions: async (params?: Record<string, string>) => {
    const res = await apiClient.get<ApiResponse<Transaction[]>>('/admin/finance/transaction', {
      params,
    });
    return res.data;
  },
  getTransactionById: async (transactionId: string) => {
    const res = await apiClient.get<ApiResponse<Transaction>>(
      `/admin/finance/transaction/${transactionId}`,
    );
    return res.data;
  },
  createTransaction: async (payload: CreateTransactionPayload | Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<Transaction>>(
      '/admin/finance/transaction',
      payload,
    );
    return res.data;
  },
  updateTransaction: async (
    transactionId: string,
    payload: Partial<CreateTransactionPayload> | Record<string, unknown>,
  ) => {
    const res = await apiClient.put<ApiResponse<Transaction>>(
      `/admin/finance/transaction/${transactionId}`,
      payload,
    );
    return res.data;
  },
  deleteTransaction: async (transactionId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/finance/transaction/${transactionId}`,
    );
    return res.data;
  },

  // Contact Messages
  getContactMessages: async () => {
    const res = await apiClient.get<ApiResponse<ContactMessage[]>>('/admin/contact');
    return res.data;
  },
  getContactMessageById: async (contactId: string) => {
    const res = await apiClient.get<ApiResponse<ContactMessage>>(`/admin/contact/${contactId}`);
    return res.data;
  },
  deleteContactMessage: async (contactId: string) => {
    const res = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/admin/contact/${contactId}`,
    );
    return res.data;
  },

  // Attendance
  getTeacherAttendanceDate: async (date: string) => {
    const res = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
      '/admin/attendance/teacher-attendance',
      {
        params: { date },
      },
    );
    return res.data;
  },
  getTeacherAttendanceMonth: async (teacherId: string, month: string) => {
    const res = await apiClient.get<ApiResponse<AttendanceRecord[]>>(
      `/admin/attendance/teacher-attendance/${teacherId}`,
      { params: { month } },
    );
    return res.data;
  },
  markTeacherAttendance: async (date: string, attendance: Array<Record<string, unknown>>) => {
    const res = await apiClient.post<ApiResponse<AttendanceRecord[]>>(
      '/admin/attendance/teacher-attendance',
      attendance,
      { params: { date } },
    );
    return res.data;
  },
  updateTeacherAttendance: async (attendance: Array<Record<string, unknown>>) => {
    const res = await apiClient.put<ApiResponse<AttendanceRecord[]>>(
      '/admin/attendance/teacher-attendance',
      attendance,
    );
    return res.data;
  },
};
