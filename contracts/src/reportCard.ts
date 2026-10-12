import { z } from 'zod';
import { ISODate, ObjectId, Session, SubjectCode } from './primitives';
import { StudentRecord } from './admin/student';

/**
 * Report cards for one exam (a term) — shared by the admin's bulk-print view
 * (`GET /admin/exam/:examId/report-cards`, every student in the class) and the student's own card
 * (`GET /student/report-card/:examId`, just theirs, but ranked against the whole class).
 */

export const ReportCardResultEnum = z.enum(['Pass', 'Fail', 'Incomplete']);
export type ReportCardResult = z.infer<typeof ReportCardResultEnum>;

export const ReportCardSubject = z.object({
  subjectCode: SubjectCode,
  subjectName: z.string(),
  fullMarks: z.number(),
  date: ISODate,
});
export type ReportCardSubject = z.infer<typeof ReportCardSubject>;

export const ReportCardStudent = z.object({
  studentId: StudentRecord.shape.studentId,
  rollNo: z.number().int(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  fatherName: z.string().nullable(),
  motherName: z.string().nullable(),
  dob: ISODate.nullable(),
  /** One entry per `subjects[]` entry, same order; `marksObtained: null` = no mark entered (absent). */
  marks: z.array(
    z.object({
      subjectCode: SubjectCode,
      marksObtained: z.number().nullable(),
      grade: z.string().nullable(),
      remark: z.string().nullable(),
    }),
  ),
  totalObtained: z.number(),
  totalFull: z.number(),
  percentage: z.number(),
  /** Overall grade on `percentage`, same scale as a subject grade. */
  grade: z.string(),
  /** Fail = any subject graded F; Incomplete = no F but at least one paper unmarked. */
  result: ReportCardResultEnum,
  /** Competition rank by percentage within the class (1, 2, 2, 4); null when no paper is marked. */
  rank: z.number().int().nullable(),
  attendance: z.object({
    workingDays: z.number().int(),
    present: z.number().int(),
    absent: z.number().int(),
    leave: z.number().int(),
    percent: z.number(),
  }),
});
export type ReportCardStudent = z.infer<typeof ReportCardStudent>;

export const ReportCardSet = z.object({
  exam: z.object({
    id: ObjectId,
    title: z.string(),
    dateFrom: ISODate,
    dateTo: ISODate.nullable(),
    isResultDecleared: z.boolean(),
    className: z.string(),
    section: z.string(),
    session: Session,
  }),
  subjects: z.array(ReportCardSubject),
  /** Attendance on the cards covers this window: session start → the exam's last day (or today). */
  attendanceFrom: ISODate,
  attendanceTo: ISODate,
  /** How many students the rank is out of. */
  classStrength: z.number().int(),
  students: z.array(ReportCardStudent),
});
export type ReportCardSet = z.infer<typeof ReportCardSet>;
