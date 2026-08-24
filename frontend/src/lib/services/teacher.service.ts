import {
  teacherContract,
  type CreateClassAttendanceBody,
  type SubmitMarksBody,
  type UpdateClassAttendanceBody,
  type UpdateMarksBody,
} from '@schoolerp/contracts';
import { api } from '../api/typed-client';

export const teacherService = {
  getProfile: () => api(teacherContract.profile),

  getDashboard: () => api(teacherContract.dashboard),

  getAnalytics: (session?: string) => api(teacherContract.analytics, { query: { session } }),

  getOwnAttendance: (month: string) => api(teacherContract.myAttendance, { query: { month } }),

  getClassAttendanceList: (month: string) =>
    api(teacherContract.classAttendanceList, { query: { month } }),

  getClassAttendanceDetail: (classAttendanceId: string) =>
    api(teacherContract.classAttendanceDetail, { params: { classAttendanceId } }),

  getClassRoster: (className: string, section: string) =>
    api(teacherContract.classRoster, { query: { className, section } }),

  createClassAttendance: (body: CreateClassAttendanceBody) =>
    api(teacherContract.markClassAttendance, { body }),

  updateClassAttendance: (classAttendanceId: string, body: UpdateClassAttendanceBody) =>
    api(teacherContract.updateClassAttendance, { params: { classAttendanceId }, body }),

  getTimetable: () => api(teacherContract.academicTimetable),

  getCalendar: () => api(teacherContract.academicCalendar),

  getExams: () => api(teacherContract.exams),

  getExamDetail: (examId: string) => api(teacherContract.examDetail, { params: { examId } }),

  getResult: (examId: string, subjectId: string) =>
    api(teacherContract.getResult, { params: { examId, subjectId } }),

  submitResult: (examId: string, subjectId: string, body: SubmitMarksBody) =>
    api(teacherContract.submitResult, { params: { examId, subjectId }, body }),

  updateResult: (examId: string, subjectId: string, body: UpdateMarksBody) =>
    api(teacherContract.updateResult, { params: { examId, subjectId }, body }),

  getNotices: () => api(teacherContract.notices),

  getNoticeById: (noticeId: string) => api(teacherContract.noticeDetail, { params: { noticeId } }),

  getSalaryTransactions: () => api(teacherContract.salary),
};
