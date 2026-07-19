import { axios } from '@/shared/utils/axios';

export const studentService = {
  // Profile
  getProfile: async () => {
    const response = await axios.get('/student');
    return response.data.data;
  },

  // Attendance
  getAttendance: async (month: string) => {
    const response = await axios.get('/student/attendance', { params: { month } });
    return response.data.data;
  },

  // Subjects
  getSubjects: async () => {
    const response = await axios.get('/student/subject');
    return response.data.data;
  },

  // Exams
  getExams: async () => {
    const response = await axios.get('/student/exam');
    return response.data.data;
  },

  // Notices
  getNotices: async () => {
    const response = await axios.get('/student/notice');
    return response.data.data;
  },

  // Academic Calendar Events
  getAcademicEvents: async () => {
    const response = await axios.get('/student/academic');
    return response.data.data;
  },

  // Results
  getResults: async (examId: string) => {
    const response = await axios.get(`/student/result/${examId}`);
    return response.data.data;
  },

  // Transactions / Fees
  getTransactions: async (year: string) => {
    const response = await axios.get('/student/transaction', { params: { year } });
    return response.data.data;
  },
  getTransactionDetail: async (feeId: string) => {
    const response = await axios.get(`/student/transaction/${feeId}`);
    return response.data.data;
  },
};
