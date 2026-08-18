import { apiClient, type ApiResponse } from '../api';
import type {
  Student,
  SubjectItem,
  Exam,
  ExamResult,
  Notice,
  TimeTableSlot,
  CalendarEvent,
  StudentFee,
  AttendanceRecord,
  StudentDashboardData,
} from '../types';

export const studentService = {
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<Student>>('/student');
    return res.data;
  },

  getDashboard: async () => {
    const res = await apiClient.get<ApiResponse<StudentDashboardData>>('/student/dashboard');
    return res.data;
  },

  getAttendance: async (month?: string) => {
    const res = await apiClient.get<ApiResponse<AttendanceRecord[]>>('/student/attendance', {
      params: month ? { month } : undefined,
    });
    return res.data;
  },

  getSubjects: async () => {
    const res = await apiClient.get<ApiResponse<SubjectItem[]>>('/student/subject/get-all-subject');
    return res.data;
  },

  getExams: async () => {
    const res = await apiClient.get<ApiResponse<Exam[]>>('/student/exam');
    return res.data;
  },

  getResult: async (examId: string) => {
    const res = await apiClient.get<ApiResponse<ExamResult>>(`/student/result/${examId}`);
    return res.data;
  },

  getNotices: async () => {
    const res = await apiClient.get<ApiResponse<Notice[]>>('/student/notice');
    return res.data;
  },

  getNoticeById: async (noticeId: string) => {
    const res = await apiClient.get<ApiResponse<Notice>>(`/student/notice/${noticeId}`);
    return res.data;
  },

  getTimetable: async () => {
    const res = await apiClient.get<ApiResponse<TimeTableSlot[]>>('/student/academic/time-table');
    return res.data;
  },

  getCalendar: async () => {
    const res = await apiClient.get<ApiResponse<CalendarEvent[]>>('/student/academic/calendar');
    return res.data;
  },

  getTransactions: async (year?: string) => {
    const res = await apiClient.get<ApiResponse<StudentFee[]>>('/student/transaction', {
      params: year ? { year } : undefined,
    });
    return res.data;
  },

  getTransactionById: async (feeId: string) => {
    const res = await apiClient.get<ApiResponse<StudentFee>>(`/student/transaction/${feeId}`);
    return res.data;
  },
};
