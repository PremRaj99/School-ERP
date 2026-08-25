import { z } from 'zod';
import { defineContract } from '../envelope';
import {
  Aadhar,
  ClassName,
  ISODate,
  PageQuery,
  Phone,
  ProfilePhotoUrl,
  Section,
  Session,
  StudentId,
  paginatedResponse,
} from '../primitives';
import { GenderEnum, StudentStatusEnum } from '../enums';

export const StudentRecord = z.object({
  studentId: StudentId,
  // D5 (ALIGNMENT_PLAN.md 2D/P3) — `Active` for every student that predates this field (Prisma
  // default, no backfill needed).
  status: StudentStatusEnum,
  firstName: z.string(),
  lastName: z.string().nullable(),
  dob: ISODate,
  // Nullable — no backfill for a document that predates this field (schema.prisma `Student.gender`).
  gender: GenderEnum.nullable(),
  address: z.string().nullable(),
  phone: Phone,
  fatherName: z.string().nullable(),
  motherName: z.string().nullable(),
  fatherOccupation: z.string().nullable(),
  motherOccupation: z.string().nullable(),
  studentAadhar: z.string().nullable(),
  fatherAadhar: z.string().nullable(),
  motherAadhar: z.string().nullable(),
  className: ClassName,
  section: Section,
  session: Session,
  dateOfAdmission: ISODate,
  rollNo: z.number().int().positive(),
  appId: z.string().nullable(),
  penNumber: z.string().nullable(),
  profilePhoto: z.string(),
  username: z.string(),
});
export type StudentRecord = z.infer<typeof StudentRecord>;

export const CreateStudentBody = z.object({
  firstName: z
    .string({ message: 'First name is required.' })
    .min(2, 'First name must be at least 2 characters long.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters long.').optional(),
  dob: ISODate,
  gender: GenderEnum.optional(),
  address: z.string().min(10, 'Address must be at least 10 characters long.').optional(),
  phone: Phone,
  fatherName: z.string().min(2).optional(),
  motherName: z.string().min(2).optional(),
  fatherOccupation: z.string().min(2).optional(),
  motherOccupation: z.string().min(2).optional(),
  studentAadhar: Aadhar.optional(),
  fatherAadhar: Aadhar.optional(),
  motherAadhar: Aadhar.optional(),
  className: ClassName,
  section: Section,
  session: Session,
  dateOfAdmission: ISODate,
  rollNo: z
    .number({ message: 'Roll No is required.' })
    .int()
    .positive('Roll No must be a positive number.'),
  appId: z.string().min(5, 'APAAR ID must be at least 5 characters long.').optional(),
  penNumber: z.string().min(5, 'PEN Number must be at least 5 characters long.').optional(),
  profilePhoto: ProfilePhotoUrl.optional(),
});
export type CreateStudentBody = z.infer<typeof CreateStudentBody>;

export const UpdateStudentBody = CreateStudentBody.partial();
export type UpdateStudentBody = z.infer<typeof UpdateStudentBody>;

export const DeleteStudentResponse = z.object({ studentId: StudentId });

// Admin-triggered reset (ALIGNMENT_PLAN.md P3) — there's no email/SMS integration in this codebase
// (CLAUDE.md: AWS/etc. in .env.example are unused placeholders), so the only way to hand a new
// credential to the student is to show it to the admin once, the same way the *initial* password
// already works (createStudent hashes `studentId` itself as the first password) — this just
// generates a fresh random one instead of resetting back to the predictable studentId.
export const ResetStudentPasswordResponse = z.object({
  username: z.string(),
  temporaryPassword: z.string(),
});
export type ResetStudentPasswordResponse = z.infer<typeof ResetStudentPasswordResponse>;

// Bulk CSV import (ALIGNMENT_PLAN.md P3) — deliberately NOT `z.array(CreateStudentBody)` even
// though one row = one `CreateStudentBody` conceptually: `defineRoute` validates the whole body
// against the contract *before* the handler ever runs, so if the body schema were
// `array(CreateStudentBody)`, one malformed row would 400 the entire request and the service's
// per-row try/catch would never even see rows that were fine. Validating each row as
// `CreateStudentBody` happens inside `AdminStudentService.bulkImportStudents` instead, specifically
// so a bad row 12 becomes one entry in `failures[]`, not a 400 that blocks rows 1-11 along with it
// — a CSV import failing atomically on one typo in a 200-row file is worse than reporting which
// rows to fix and re-import.
export const BulkImportStudentsBody = z
  .array(z.unknown())
  .min(1, 'Provide at least one student row.')
  .max(500, 'Import at most 500 students at a time.');
export type BulkImportStudentsBody = z.infer<typeof BulkImportStudentsBody>;

export const BulkImportStudentsResponse = z.object({
  successCount: z.number().int(),
  failureCount: z.number().int(),
  created: z.array(StudentRecord),
  // `row` is the 0-based index into the submitted body array, so the frontend can point back at
  // the matching CSV line.
  failures: z.array(z.object({ row: z.number().int(), message: z.string() })),
});
export type BulkImportStudentsResponse = z.infer<typeof BulkImportStudentsResponse>;

export const StudentListQuery = PageQuery.extend({
  className: ClassName.optional(),
  section: Section.optional(),
  session: Session.optional(),
  // Omitted -> service defaults to `Active` only (D5) — a graduated/transferred-out student
  // shouldn't clutter the everyday roster by default; pass explicitly to see other statuses.
  status: StudentStatusEnum.optional(),
  sortBy: z.enum(['rollNo', 'firstName', 'dateOfAdmission', 'studentId']).optional(),
});
export type StudentListQuery = z.infer<typeof StudentListQuery>;

export const adminStudentContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/student',
    query: StudentListQuery,
    response: paginatedResponse(StudentRecord),
  },
  detail: {
    method: 'GET',
    path: '/admin/student/:studentId',
    params: z.object({ studentId: StudentId }),
    response: StudentRecord,
  },
  create: {
    method: 'POST',
    path: '/admin/student',
    body: CreateStudentBody,
    response: StudentRecord,
    successStatus: 201,
    summary: 'Also creates the linked login User with a generated STU######## username.',
  },
  update: {
    method: 'PUT',
    path: '/admin/student/:studentId',
    params: z.object({ studentId: StudentId }),
    body: UpdateStudentBody,
    response: StudentRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/student/:studentId',
    params: z.object({ studentId: StudentId }),
    response: DeleteStudentResponse,
    successStatus: 202,
  },
  resetPassword: {
    method: 'POST',
    path: '/admin/student/:studentId/reset-password',
    params: z.object({ studentId: StudentId }),
    response: ResetStudentPasswordResponse,
    successStatus: 201,
    summary: 'Generates and sets a new random temporary password, returned once in the response.',
  },
  bulkImport: {
    method: 'POST',
    path: '/admin/student/bulk',
    body: BulkImportStudentsBody,
    response: BulkImportStudentsResponse,
    successStatus: 201,
    summary:
      'Creates one Student (+ linked User) per row; failures are reported per-row, not atomic.',
  },
} as const);
