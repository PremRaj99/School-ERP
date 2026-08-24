import { z } from 'zod';
import { defineContract } from '../envelope';
import {
  ClassName,
  ISODate,
  ObjectId,
  PageQuery,
  Section,
  SubjectCode,
  TeacherId,
  paginatedResponse,
} from '../primitives';

export const ExamRecord = z.object({
  id: ObjectId,
  title: z.string(),
  className: ClassName,
  section: Section,
  dateFrom: ISODate,
  dateTo: ISODate.nullable(),
  isResultDecleared: z.boolean(),
});
export type ExamRecord = z.infer<typeof ExamRecord>;

/** One subject slot within an exam, as seen by admin — mirrors `TeacherExamSubject`
 * (`contracts/src/teacher/index.ts`) plus the assigned teacher, since admin (unlike a teacher
 * looking at their own exams) needs to see who's responsible for each subject. */
export const AdminExamSubject = z.object({
  examSubjectId: ObjectId,
  subjectId: ObjectId,
  subjectName: z.string(),
  subjectCode: SubjectCode,
  teacherId: TeacherId,
  teacherFullName: z.string(),
  date: ISODate,
  fullMarks: z.number(),
  isMarked: z.boolean(),
});
export type AdminExamSubject = z.infer<typeof AdminExamSubject>;

export const ExamDetail = ExamRecord.extend({
  subjects: z.array(AdminExamSubject),
});
export type ExamDetail = z.infer<typeof ExamDetail>;

const CreateExamSubjectRow = z.object({
  subjectCode: SubjectCode,
  date: ISODate,
  fullMarks: z
    .number({ message: 'Full Marks is required.' })
    .nonnegative('Full Marks cannot be negative.')
    .max(100, 'Full Marks must be 100 or less.'),
});

const CreateExamClassGroup = z.object({
  className: ClassName,
  section: Section,
  subjects: z.array(CreateExamSubjectRow),
});

export const CreateExamBody = z.object({
  title: z
    .string({ message: 'Exam Title is required.' })
    .min(3, 'Exam Title must be more than 3 characters.'),
  dateFrom: ISODate,
  dateTo: ISODate,
  exams: z.array(CreateExamClassGroup),
});
export type CreateExamBody = z.infer<typeof CreateExamBody>;

export const DeclareResultBody = z.object({
  isResultDecleared: z.boolean({ message: 'isResultDecleared is required.' }),
});
export type DeclareResultBody = z.infer<typeof DeclareResultBody>;

// Metadata-only edit (ALIGNMENT_PLAN.md P3) — deliberately excludes `exams[]` (class/section/
// subjects). Once results start getting marked against an ExamSubject, restructuring which
// classes/subjects an exam covers risks orphaning ExamResult rows; that's a delete-and-recreate,
// not an edit.
export const UpdateExamBody = z.object({
  title: z.string().min(3, 'Exam Title must be more than 3 characters.').optional(),
  dateFrom: ISODate.optional(),
  dateTo: ISODate.optional(),
});
export type UpdateExamBody = z.infer<typeof UpdateExamBody>;

export const DeleteExamResponse = z.object({ id: ObjectId });

export const ExamListQuery = PageQuery.extend({
  className: ClassName.optional(),
  section: Section.optional(),
  // Not `z.coerce.boolean()` — `Boolean("false")` is `true` in JS, so coercing a query string that
  // way would make `?isResultDecleared=false` filter for *declared* exams. Parse the two literal
  // strings a query param can actually be instead.
  isResultDecleared: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z.enum(['dateFrom', 'title']).optional(),
});
export type ExamListQuery = z.infer<typeof ExamListQuery>;

export const adminExamContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/exam',
    query: ExamListQuery,
    response: paginatedResponse(ExamRecord),
  },
  detail: {
    method: 'GET',
    path: '/admin/exam/:examId',
    params: z.object({ examId: ObjectId }),
    response: ExamDetail,
  },
  create: {
    method: 'POST',
    path: '/admin/exam',
    body: CreateExamBody,
    // One `CreateExamBody` can create one Exam row per class group in `exams[]` — the response is
    // all of them, not a single resource, since that's genuinely what got created.
    response: z.array(ExamRecord),
    successStatus: 201,
    summary: 'Creates one Exam per class group in the body.',
  },
  update: {
    method: 'PUT',
    path: '/admin/exam/:examId',
    params: z.object({ examId: ObjectId }),
    body: UpdateExamBody,
    response: ExamRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/exam/:examId',
    params: z.object({ examId: ObjectId }),
    response: DeleteExamResponse,
    successStatus: 202,
  },
  declareResult: {
    method: 'PUT',
    path: '/admin/exam/:examId/declare-result',
    params: z.object({ examId: ObjectId }),
    body: DeclareResultBody,
    response: ExamRecord,
    successStatus: 202,
  },
} as const);
