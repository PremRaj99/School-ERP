import { axios } from '@/shared/utils/axios';

export const teacherService = {
  // Profile
  getProfile: async () => {
    const response = await axios.get('/teacher');
    return response.data.data;
  },

  // Own Attendance
  getOwnAttendance: async (month: string) => {
    const response = await axios.get('/teacher/attendance', { params: { month } });
    return response.data.data;
  },

  // Class Attendance List
  getClassAttendanceLogs: async (month: string) => {
    const response = await axios.get('/teacher/attendance/class', { params: { month } });
    return response.data.data;
  },
  getClassAttendanceDetails: async (classAttendanceId: string) => {
    const response = await axios.get(`/teacher/attendance/class/${classAttendanceId}`);
    return response.data.data;
  },
  createClassAttendance: async (data: {
    className: string;
    section: string;
    date: string;
    attendance: Array<{ studentId: string; status: 'Present' | 'Absent' | 'Leave' }>;
  }) => {
    const response = await axios.post('/teacher/attendance/class', data);
    return response.data.data;
  },
  updateClassAttendance: async (
    attendanceList: Array<{
      id: string;
      studentId: string;
      status: 'Present' | 'Absent' | 'Leave';
    }>,
  ) => {
    const response = await axios.put('/teacher/attendance/class', attendanceList);
    return response.data.data;
  },

  // Exams List
  getExams: async () => {
    const response = await axios.get('/teacher/exam');
    return response.data.data;
  },

  // Notices
  getNotices: async () => {
    const response = await axios.get('/teacher/notice');
    return response.data.data;
  },

  // Student Results
  getResults: async (examId: string, subjectId: string) => {
    const response = await axios.get(`/teacher/result/${examId}/${subjectId}`);
    return response.data.data;
  },
  createResults: async (
    examId: string,
    subjectId: string,
    results: Array<{ studentId: string; marksObtained: number; remark: string }>,
  ) => {
    const response = await axios.post(`/teacher/result/${examId}/${subjectId}`, results);
    return response.data.data;
  },
  updateResults: async (
    examId: string,
    subjectId: string,
    results: Array<{ studentId: string; marksObtained: number; remark: string }>,
  ) => {
    const response = await axios.put(`/teacher/result/${examId}/${subjectId}`, results);
    return response.data.data;
  },

  // Salary Slip Transactions
  getSalaryTransactions: async () => {
    const response = await axios.get('/teacher/transaction');
    return response.data.data;
  },
};
