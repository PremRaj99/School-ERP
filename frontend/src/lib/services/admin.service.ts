import {
  adminAcademicCalendarContract,
  adminAnalyticsContract,
  adminClassContract,
  adminContactContract,
  adminDashboardContract,
  adminExamContract,
  adminNoticeContract,
  adminPromotionContract,
  adminStudentAttendanceContract,
  adminStudentContract,
  adminStudentFeeContract,
  adminSubjectContract,
  adminTeacherAttendanceContract,
  adminTeacherContract,
  adminTeacherSalaryContract,
  adminTimetableContract,
  adminTransactionContract,
  type AdminDashboard,
  type AdminStudentAttendanceQuery,
  type BulkImportStudentsBody,
  type CalendarEventRecord,
  type ClassListQuery,
  type ClassRecord,
  type ContactListQuery,
  type ContactRecord,
  type CreateCalendarEventBody,
  type CreateClassBody,
  type CreateExamBody,
  type CreateNoticeBody,
  type CreateStudentBody,
  type CreateStudentFeeBody,
  type CreateSubjectBody,
  type CreateTeacherBody,
  type CreateTeacherSalaryBody,
  type CreateTransactionBody,
  type ExamListQuery,
  type ExamRecord,
  type MarkTeacherAttendanceBody,
  type NoticeListQuery,
  type NoticeRecord,
  type PromoteClassBody,
  type StudentFeeListQuery,
  type StudentFeeRecord,
  type StudentListQuery,
  type StudentRecord,
  type SubjectRecord,
  type TeacherListQuery,
  type TeacherRecord,
  type TeacherSalaryListQuery,
  type TeacherSalaryRecord,
  type TransactionListQuery,
  type TransactionRecord,
  type UpdateClassBody,
  type UpdateExamBody,
  type UpdateNoticeBody,
  type UpdateStudentBody,
  type UpdateSubjectBody,
  type UpdateTeacherAttendanceBody,
  type UpdateTeacherBody,
  type UpdateTimeTableBody,
  type UpdateTransactionBody,
} from '@schoolerp/contracts';
import { api } from '../api/typed-client';

export const adminService = {
  // Dashboard
  getDashboard: (): Promise<AdminDashboard> => api(adminDashboardContract.get),

  // Students — contract-backed: request/response shapes come from @schoolerp/contracts, so a
  // mismatch with the backend is a build-time type error here, not a runtime surprise.
  getStudents: (query?: StudentListQuery) => api(adminStudentContract.list, { query: query ?? {} }),
  getStudentById: (studentId: string): Promise<StudentRecord> =>
    api(adminStudentContract.detail, { params: { studentId } }),
  createStudent: (body: CreateStudentBody): Promise<StudentRecord> =>
    api(adminStudentContract.create, { body }),
  updateStudent: (studentId: string, body: UpdateStudentBody): Promise<StudentRecord> =>
    api(adminStudentContract.update, { params: { studentId }, body }),
  deleteStudent: (studentId: string): Promise<{ studentId: string }> =>
    api(adminStudentContract.remove, { params: { studentId } }),
  resetStudentPassword: (studentId: string) =>
    api(adminStudentContract.resetPassword, { params: { studentId } }),
  bulkImportStudents: (body: BulkImportStudentsBody) =>
    api(adminStudentContract.bulkImport, { body }),

  // Teachers
  getTeachers: (query?: TeacherListQuery) => api(adminTeacherContract.list, { query: query ?? {} }),
  getTeacherById: (teacherId: string): Promise<TeacherRecord> =>
    api(adminTeacherContract.detail, { params: { teacherId } }),
  createTeacher: (body: CreateTeacherBody): Promise<TeacherRecord> =>
    api(adminTeacherContract.create, { body }),
  updateTeacher: (teacherId: string, body: UpdateTeacherBody): Promise<TeacherRecord> =>
    api(adminTeacherContract.update, { params: { teacherId }, body }),
  deleteTeacher: (teacherId: string): Promise<{ teacherId: string }> =>
    api(adminTeacherContract.remove, { params: { teacherId } }),
  resetTeacherPassword: (teacherId: string) =>
    api(adminTeacherContract.resetPassword, { params: { teacherId } }),

  // Classes
  getClasses: (query?: ClassListQuery): Promise<ClassRecord[]> =>
    api(adminClassContract.list, { query: query ?? {} }),
  createClass: (body: CreateClassBody): Promise<ClassRecord> =>
    api(adminClassContract.create, { body }),
  updateClass: (classId: string, body: UpdateClassBody): Promise<ClassRecord> =>
    api(adminClassContract.update, { params: { classId }, body }),
  deleteClass: (classId: string): Promise<{ id: string }> =>
    api(adminClassContract.remove, { params: { classId } }),

  // Subjects
  getSubjects: (): Promise<SubjectRecord[]> => api(adminSubjectContract.list),
  getAllClassSubjects: () => api(adminSubjectContract.groupedByClass),
  createSubject: (body: CreateSubjectBody): Promise<SubjectRecord> =>
    api(adminSubjectContract.create, { body }),
  updateSubject: (subjectCode: string, body: UpdateSubjectBody): Promise<SubjectRecord> =>
    api(adminSubjectContract.update, { params: { subjectCode }, body }),
  deleteSubject: (subjectCode: string): Promise<{ subjectCode: string }> =>
    api(adminSubjectContract.remove, { params: { subjectCode } }),

  // Exams
  getExams: (query?: ExamListQuery) => api(adminExamContract.list, { query: query ?? {} }),
  getExamById: (examId: string) => api(adminExamContract.detail, { params: { examId } }),
  createExam: (body: CreateExamBody): Promise<ExamRecord[]> =>
    api(adminExamContract.create, { body }),
  updateExam: (examId: string, body: UpdateExamBody): Promise<ExamRecord> =>
    api(adminExamContract.update, { params: { examId }, body }),
  deleteExam: (examId: string): Promise<{ id: string }> =>
    api(adminExamContract.remove, { params: { examId } }),
  declareResult: (examId: string, isResultDecleared: boolean): Promise<ExamRecord> =>
    api(adminExamContract.declareResult, { params: { examId }, body: { isResultDecleared } }),

  // Notices
  getNotices: (query?: NoticeListQuery) => api(adminNoticeContract.list, { query: query ?? {} }),
  getNoticeById: (noticeId: string): Promise<NoticeRecord> =>
    api(adminNoticeContract.detail, { params: { noticeId } }),
  createNotice: (body: CreateNoticeBody): Promise<NoticeRecord> =>
    api(adminNoticeContract.create, { body }),
  updateNotice: (noticeId: string, body: UpdateNoticeBody): Promise<NoticeRecord> =>
    api(adminNoticeContract.update, { params: { noticeId }, body }),
  deleteNotice: (noticeId: string): Promise<{ id: string }> =>
    api(adminNoticeContract.remove, { params: { noticeId } }),

  // Academic (Timetable & Calendar)
  getTimetable: () => api(adminTimetableContract.get),
  updateTimetableSlot: (body: UpdateTimeTableBody) => api(adminTimetableContract.update, { body }),
  getCalendar: (): Promise<CalendarEventRecord[]> => api(adminAcademicCalendarContract.list),
  createCalendarEvent: (body: CreateCalendarEventBody): Promise<CalendarEventRecord> =>
    api(adminAcademicCalendarContract.create, { body }),
  deleteCalendarEvent: (calendarId: string): Promise<{ id: string }> =>
    api(adminAcademicCalendarContract.remove, { params: { calendarId } }),

  // Finance
  getStudentFees: (query?: StudentFeeListQuery) =>
    api(adminStudentFeeContract.list, { query: query ?? {} }),
  getStudentFeeById: (feeId: string) => api(adminStudentFeeContract.detail, { params: { feeId } }),
  createStudentFee: (body: CreateStudentFeeBody) => api(adminStudentFeeContract.create, { body }),
  updateStudentFeeStatus: (
    feeId: string,
    status: StudentFeeRecord['status'],
  ): Promise<StudentFeeRecord> =>
    api(adminStudentFeeContract.updateStatus, { params: { feeId }, body: { status } }),
  deleteStudentFee: (feeId: string): Promise<{ id: string }> =>
    api(adminStudentFeeContract.remove, { params: { feeId } }),

  getTeacherSalaries: (query?: TeacherSalaryListQuery) =>
    api(adminTeacherSalaryContract.list, { query: query ?? {} }),
  getTeacherSalaryById: (salaryId: string) =>
    api(adminTeacherSalaryContract.detail, { params: { salaryId } }),
  createTeacherSalary: (body: CreateTeacherSalaryBody) =>
    api(adminTeacherSalaryContract.create, { body }),
  updateTeacherSalaryStatus: (
    salaryId: string,
    status: TeacherSalaryRecord['status'],
  ): Promise<TeacherSalaryRecord> =>
    api(adminTeacherSalaryContract.updateStatus, { params: { salaryId }, body: { status } }),
  deleteTeacherSalary: (salaryId: string): Promise<{ id: string }> =>
    api(adminTeacherSalaryContract.remove, { params: { salaryId } }),

  getTransactions: (query?: TransactionListQuery): Promise<TransactionRecord[]> =>
    api(adminTransactionContract.list, { query: query ?? {} }),
  getTransactionById: (transactionId: string) =>
    api(adminTransactionContract.detail, { params: { transactionId } }),
  createTransaction: (body: CreateTransactionBody): Promise<TransactionRecord> =>
    api(adminTransactionContract.create, { body }),
  updateTransaction: (
    transactionId: string,
    body: UpdateTransactionBody,
  ): Promise<TransactionRecord> =>
    api(adminTransactionContract.update, { params: { transactionId }, body }),
  deleteTransaction: (transactionId: string): Promise<{ id: string }> =>
    api(adminTransactionContract.remove, { params: { transactionId } }),
  getExpenseCategories: (): Promise<string[]> => api(adminTransactionContract.expenseCategories),

  // Contact Messages
  getContactMessages: (query?: ContactListQuery) =>
    api(adminContactContract.list, { query: query ?? {} }),
  getContactMessageById: (contactId: string): Promise<ContactRecord> =>
    api(adminContactContract.detail, { params: { contactId } }),
  deleteContactMessage: (contactId: string): Promise<{ id: string }> =>
    api(adminContactContract.remove, { params: { contactId } }),

  // Attendance
  getTeacherAttendanceDate: (date: string) =>
    api(adminTeacherAttendanceContract.getByDate, { query: { date } }),
  getTeacherAttendanceMonth: (teacherId: string, month: string) =>
    api(adminTeacherAttendanceContract.getByMonth, { params: { teacherId }, query: { month } }),
  markTeacherAttendance: (date: string, attendance: MarkTeacherAttendanceBody) =>
    api(adminTeacherAttendanceContract.mark, { query: { date }, body: attendance }),
  updateTeacherAttendance: (attendance: UpdateTeacherAttendanceBody) =>
    api(adminTeacherAttendanceContract.update, { body: attendance }),
  getStudentAttendanceReport: (query: AdminStudentAttendanceQuery) =>
    api(adminStudentAttendanceContract.report, { query }),

  // Session promotion
  promoteClass: (body: PromoteClassBody) => api(adminPromotionContract.promote, { body }),

  // Analytics
  getAnalyticsOverview: (session?: string) =>
    api(adminAnalyticsContract.overview, { query: { session } }),
  getAnalyticsAttendance: (from: string, to: string, className?: string, section?: string) =>
    api(adminAnalyticsContract.attendance, { query: { from, to, className, section } }),
  getAnalyticsAcademics: (examId: string) =>
    api(adminAnalyticsContract.academics, { query: { examId } }),
  getAnalyticsFinance: (session?: string) =>
    api(adminAnalyticsContract.finance, { query: { session } }),
  getAnalyticsStaff: (month: string) => api(adminAnalyticsContract.staff, { query: { month } }),
};
