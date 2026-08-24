import { studentContract } from '@schoolerp/contracts';
import { api } from '../api/typed-client';

export const studentService = {
  getProfile: () => api(studentContract.profile),

  getDashboard: () => api(studentContract.dashboard),

  getAnalytics: () => api(studentContract.analytics),

  getAttendance: (month: string) => api(studentContract.attendance, { query: { month } }),

  getSubjects: () => api(studentContract.subjects),

  getExams: () => api(studentContract.exams),

  getResult: (examId: string) => api(studentContract.result, { params: { examId } }),

  getNotices: () => api(studentContract.notices),

  getNoticeById: (noticeId: string) => api(studentContract.noticeDetail, { params: { noticeId } }),

  getTimetable: () => api(studentContract.timetable),

  getCalendar: () => api(studentContract.calendar),

  getTransactions: (year: string) => api(studentContract.fees, { query: { year } }),

  getTransactionById: (feeId: string) => api(studentContract.feeDetail, { params: { feeId } }),
};
