import { apiClient, type ApiResponse } from '../api';
import type {
  Teacher,
  Exam,
  ExamResult,
  Notice,
  AttendanceRecord,
  ClassAttendanceDetail,
  TeacherSalary,
  TeacherDashboardData,
} from '../types';

export const teacherService = {
  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<Teacher>>('/teacher');
    return res.data;
  },

  getDashboard: async () => {
    const res = await apiClient.get<ApiResponse<TeacherDashboardData>>('/teacher/dashboard');
    return res.data;
  },

  getOwnAttendance: async (month?: string) => {
    const res = await apiClient.get<ApiResponse<AttendanceRecord[]>>('/teacher/attendance', {
      params: month ? { month } : undefined,
    });
    return res.data;
  },

  getClassAttendanceList: async (month?: string) => {
    const res = await apiClient.get<ApiResponse<ClassAttendanceDetail[]>>(
      '/teacher/attendance/class-attendance',
      {
        params: month ? { month } : undefined,
      },
    );
    return res.data;
  },

  getClassAttendanceDetail: async (classAttendanceId: string) => {
    const res = await apiClient.get<ApiResponse<ClassAttendanceDetail>>(
      `/teacher/attendance/class-attendance/${classAttendanceId}`,
    );
    return res.data;
  },

  createClassAttendance: async (payload: {
    date: string;
    className: string;
    section: string;
    attendance: Array<{ studentId: string; status: string }>;
  }) => {
    const res = await apiClient.post<ApiResponse<ClassAttendanceDetail>>(
      '/teacher/attendance/class-attendance',
      payload,
    );
    return res.data;
  },

  updateClassAttendance: async (
    classAttendanceId: string,
    payload: { attendance: Array<{ id?: string; studentId: string; status: string }> },
  ) => {
    const res = await apiClient.put<ApiResponse<ClassAttendanceDetail>>(
      `/teacher/attendance/class-attendance/${classAttendanceId}`,
      payload,
    );
    return res.data;
  },

  getExams: async () => {
    const res = await apiClient.get<ApiResponse<Exam[]>>('/teacher/exam');
    return res.data;
  },

  getExamDetail: async (examId: string) => {
    const res = await apiClient.get<ApiResponse<Exam>>(`/teacher/exam/${examId}`);
    return res.data;
  },

  getResult: async (examId: string, subjectId: string) => {
    const res = await apiClient.get<ApiResponse<ExamResult[]>>(
      `/teacher/result/${examId}/${subjectId}`,
    );
    return res.data;
  },

  submitResult: async (
    examId: string,
    subjectId: string,
    results: Array<{ studentId: string; marksObtained: number; remark?: string }>,
  ) => {
    const res = await apiClient.post<ApiResponse<ExamResult[]>>(
      `/teacher/result/${examId}/${subjectId}`,
      results,
    );
    return res.data;
  },

  updateResult: async (
    examId: string,
    subjectId: string,
    results: Array<{ id?: string; studentId: string; marksObtained: number; remark?: string }>,
  ) => {
    const res = await apiClient.put<ApiResponse<ExamResult[]>>(
      `/teacher/result/${examId}/${subjectId}`,
      results,
    );
    return res.data;
  },

  getNotices: async () => {
    const res = await apiClient.get<ApiResponse<Notice[]>>('/teacher/notice');
    return res.data;
  },

  getNoticeById: async (noticeId: string) => {
    const res = await apiClient.get<ApiResponse<Notice>>(`/teacher/notice/${noticeId}`);
    return res.data;
  },

  getSalaryTransactions: () => {
    return apiClient
      .get<ApiResponse<TeacherSalary[]>>('/teacher/transaction')
      .then((res) => res.data);
  },
};
