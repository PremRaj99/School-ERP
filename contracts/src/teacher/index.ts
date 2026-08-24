import { z } from 'zod';
import { defineContract } from '../envelope';
import {
  ClassName,
  ISODate,
  ISOMonth,
  ObjectId,
  Section,
  Session,
  SubjectCode,
} from '../primitives';
import { AttendanceStatusEnum, TxnStatusEnum } from '../enums';
import { TeacherRecord } from '../admin/teacher';
import { NoticeRecord, NoticeSummary } from '../admin/notice';
import { ClassSchedule } from '../admin/timetable';
import { CalendarEventRecord } from '../admin/academicCalendar';

// ---- Profile / dashboard ----------------------------------------------------

export const TeacherDashboard = z.object({
  profile: z.object({
    teacherId: TeacherRecord.shape.teacherId,
    firstName: z.string(),
    lastName: z.string().nullable(),
    subjectHandled: z.array(z.string()),
    profilePhoto: z.string(),
  }),
  attendanceThisMonth: z.object({
    present: z.number().int(),
    absent: z.number().int(),
    leave: z.number().int(),
    total: z.number().int(),
  }),
  todaySchedule: z.array(
    z.object({
      periodNumber: z.number().int(),
      className: ClassName,
      section: Section,
      subjectCode: SubjectCode,
      subjectName: z.string(),
    }),
  ),
  pendingResultEntries: z.array(
    z.object({
      examSubjectId: ObjectId,
      examId: ObjectId,
      examTitle: z.string(),
      className: ClassName,
      section: Section,
      subjectCode: SubjectCode,
      subjectName: z.string(),
      date: ISODate,
    }),
  ),
  recentNotices: z.array(NoticeSummary),
  pendingSalary: z.object({ count: z.number().int(), totalAmount: z.number() }),
});
export type TeacherDashboard = z.infer<typeof TeacherDashboard>;

// ---- Attendance ---------------------------------------------------------

export const MyAttendanceDay = z.object({ date: ISODate, status: AttendanceStatusEnum });
export type MyAttendanceDay = z.infer<typeof MyAttendanceDay>;

export const ClassAttendanceSummary = z.object({
  id: ObjectId,
  date: ISODate,
  className: ClassName,
  section: Section,
  isMarked: z.boolean(),
});
export type ClassAttendanceSummary = z.infer<typeof ClassAttendanceSummary>;

export const ClassAttendanceStudentRow = z.object({
  id: ObjectId.optional(),
  rollNo: z.number().int(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  studentId: ObjectId,
  status: z.enum(['Present', 'Absent', 'Leave', 'Unmarked']),
});
export type ClassAttendanceStudentRow = z.infer<typeof ClassAttendanceStudentRow>;

export const ClassAttendanceDetail = ClassAttendanceSummary.extend({
  students: z.array(ClassAttendanceStudentRow),
});
export type ClassAttendanceDetail = z.infer<typeof ClassAttendanceDetail>;

export const CreateClassAttendanceBody = z.object({
  date: ISODate,
  className: ClassName,
  section: Section,
  attendance: z.array(
    z.object({
      studentId: z
        .string({ message: 'StudentId is required.' })
        .min(3, 'StudentId should be at least 3 characters long.'),
      status: z.enum(['Present', 'Absent']),
    }),
  ),
});
export type CreateClassAttendanceBody = z.infer<typeof CreateClassAttendanceBody>;

export const UpdateClassAttendanceBody = z.array(
  z.object({
    id: z.string({ message: 'Id is required.' }).min(3, 'Id should be at least 3 characters long.'),
    studentId: z
      .string({ message: 'StudentId is required.' })
      .min(3, 'StudentId should be at least 3 characters long.'),
    status: z.enum(['Present', 'Absent']),
  }),
);
export type UpdateClassAttendanceBody = z.infer<typeof UpdateClassAttendanceBody>;

// ---- Exams / results ------------------------------------------------------

export const TeacherExamSummary = z.object({
  id: ObjectId,
  className: ClassName,
  section: Section,
  dateFrom: ISODate,
  dateTo: ISODate.nullable(),
  title: z.string(),
  isResultDecleared: z.boolean(),
});
export type TeacherExamSummary = z.infer<typeof TeacherExamSummary>;

export const TeacherExamSubject = z.object({
  examSubjectId: ObjectId,
  subjectId: ObjectId,
  subjectName: z.string(),
  subjectCode: SubjectCode,
  date: ISODate,
  fullMarks: z.number(),
  isMarked: z.boolean(),
});
export type TeacherExamSubject = z.infer<typeof TeacherExamSubject>;

export const TeacherExamDetail = TeacherExamSummary.extend({
  subjects: z.array(TeacherExamSubject),
});
export type TeacherExamDetail = z.infer<typeof TeacherExamDetail>;

export const ResultRow = z.object({
  id: ObjectId.nullable(),
  studentId: ObjectId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  date: ISODate,
  rollNo: z.number().int(),
  marksObtained: z.number(),
  grade: z.string(),
  remark: z.string().nullable(),
});
export type ResultRow = z.infer<typeof ResultRow>;

export const ResultSheet = z.object({
  id: ObjectId,
  dateFrom: ISODate,
  dateTo: ISODate.nullable(),
  title: z.string(),
  className: ClassName,
  section: Section,
  subjectCode: SubjectCode,
  subjectName: z.string(),
  fullMarks: z.number(),
  isMarked: z.boolean(),
  marks: z.array(ResultRow),
});
export type ResultSheet = z.infer<typeof ResultSheet>;

export const SubmitMarksBody = z.array(
  z.object({
    studentId: z
      .string({ message: 'StudentId is required.' })
      .min(3, 'Student must be more than 3 characters.'),
    marksObtained: z
      .number({ message: 'Marks is required.' })
      .nonnegative('Marks should be at least 0.'),
    remark: z.string().optional(),
  }),
);
export type SubmitMarksBody = z.infer<typeof SubmitMarksBody>;

export const UpdateMarksBody = z.array(
  z.object({
    id: z.string({ message: 'Id is required.' }).min(3, 'Id must be more than 3 characters.'),
    studentId: z
      .string({ message: 'StudentId is required.' })
      .min(3, 'Student must be more than 3 characters.'),
    marksObtained: z
      .number({ message: 'Marks is required.' })
      .nonnegative('Marks should be at least 0.'),
    remark: z.string().optional(),
  }),
);
export type UpdateMarksBody = z.infer<typeof UpdateMarksBody>;

// ---- Salary (view-only) -----------------------------------------------------

export const MySalaryRecord = z.object({
  id: ObjectId,
  month: ISOMonth,
  finalAmount: z.number(),
  status: TxnStatusEnum,
  // Renamed from the old `amount`/`isPaid` (ALIGNMENT_PLAN.md 2B) to match the naming every other
  // finance record in the app uses (`StudentFeeRecord`, `TeacherSalaryRecord`, `TransactionRecord`)
  // — one vocabulary for "how much" and "what state", not three.
  paidAt: ISODate,
});
export type MySalaryRecord = z.infer<typeof MySalaryRecord>;

// ---- Analytics ---------------------------------------------------------------

export const TeacherAnalytics = z.object({
  ownAttendanceTrend: z.array(z.object({ month: ISOMonth, presentPct: z.number() })),
  classAttendanceTrend: z.array(
    z.object({ className: ClassName, section: Section, month: ISOMonth, presentPct: z.number() }),
  ),
  /** One row per exam-subject this teacher has marked, chronological — feeds a per-subject
   * multi-line chart of class average over time. */
  subjectAverages: z.array(
    z.object({
      subjectCode: SubjectCode,
      subjectName: z.string(),
      examTitle: z.string(),
      date: ISODate,
      averagePct: z.number(),
    }),
  ),
  /** `null` if this teacher hasn't marked any exam yet. */
  lastExamGradeDistribution: z
    .array(z.object({ grade: z.string(), count: z.number().int() }))
    .nullable(),
  markingBacklog: z.object({ marked: z.number().int(), total: z.number().int() }),
});
export type TeacherAnalytics = z.infer<typeof TeacherAnalytics>;

// ---- Contract group ---------------------------------------------------------

export const teacherContract = defineContract({
  profile: {
    method: 'GET',
    path: '/teacher',
    response: TeacherRecord,
  },
  dashboard: {
    method: 'GET',
    path: '/teacher/dashboard',
    response: TeacherDashboard,
  },
  analytics: {
    method: 'GET',
    path: '/teacher/analytics',
    query: z.object({ session: Session.optional() }),
    response: TeacherAnalytics,
  },
  myAttendance: {
    method: 'GET',
    path: '/teacher/attendance',
    query: z.object({ month: ISOMonth }),
    response: z.array(MyAttendanceDay),
  },
  classAttendanceList: {
    method: 'GET',
    path: '/teacher/attendance/class-attendance',
    query: z.object({ month: ISOMonth }),
    response: z.array(ClassAttendanceSummary),
  },
  classAttendanceDetail: {
    method: 'GET',
    path: '/teacher/attendance/class-attendance/:classAttendanceId',
    params: z.object({ classAttendanceId: ObjectId }),
    response: ClassAttendanceDetail,
  },
  /** The class's roster with every student `'Unmarked'` — for a day that has no `ClassAttendance`
   * record yet, `classAttendanceDetail` has nothing to fetch, so this is how the frontend sources
   * who to mark before the first `markClassAttendance` POST for that class exists. */
  classRoster: {
    method: 'GET',
    path: '/teacher/attendance/roster',
    query: z.object({ className: ClassName, section: Section }),
    response: z.array(ClassAttendanceStudentRow),
  },
  markClassAttendance: {
    method: 'POST',
    path: '/teacher/attendance/class-attendance',
    body: CreateClassAttendanceBody,
    response: ClassAttendanceDetail,
    successStatus: 201,
  },
  updateClassAttendance: {
    method: 'PUT',
    path: '/teacher/attendance/class-attendance/:classAttendanceId',
    params: z.object({ classAttendanceId: ObjectId }),
    body: UpdateClassAttendanceBody,
    response: ClassAttendanceDetail,
    successStatus: 202,
  },
  academicTimetable: {
    method: 'GET',
    path: '/teacher/academic/time-table',
    response: z.array(ClassSchedule),
  },
  academicCalendar: {
    method: 'GET',
    path: '/teacher/academic/calendar',
    response: z.array(CalendarEventRecord),
  },
  exams: {
    method: 'GET',
    path: '/teacher/exam',
    response: z.array(TeacherExamSummary),
  },
  examDetail: {
    method: 'GET',
    path: '/teacher/exam/:examId',
    params: z.object({ examId: ObjectId }),
    response: TeacherExamDetail,
  },
  getResult: {
    method: 'GET',
    path: '/teacher/result/:examId/:subjectId',
    params: z.object({ examId: ObjectId, subjectId: ObjectId }),
    response: ResultSheet,
  },
  submitResult: {
    method: 'POST',
    path: '/teacher/result/:examId/:subjectId',
    params: z.object({ examId: ObjectId, subjectId: ObjectId }),
    body: SubmitMarksBody,
    response: ResultSheet,
    successStatus: 201,
  },
  updateResult: {
    method: 'PUT',
    path: '/teacher/result/:examId/:subjectId',
    params: z.object({ examId: ObjectId, subjectId: ObjectId }),
    body: UpdateMarksBody,
    response: ResultSheet,
    successStatus: 202,
  },
  notices: {
    method: 'GET',
    path: '/teacher/notice',
    response: z.array(NoticeSummary),
  },
  noticeDetail: {
    method: 'GET',
    path: '/teacher/notice/:noticeId',
    params: z.object({ noticeId: ObjectId }),
    response: NoticeRecord,
  },
  salary: {
    method: 'GET',
    path: '/teacher/transaction',
    response: z.array(MySalaryRecord),
  },
} as const);
