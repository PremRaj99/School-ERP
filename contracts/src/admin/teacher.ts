import { z } from 'zod';
import { defineContract } from '../envelope';
import {
  Aadhar,
  ISODate,
  PageQuery,
  Phone,
  ProfilePhotoUrl,
  TeacherId,
  paginatedResponse,
} from '../primitives';

export const TeacherRecord = z.object({
  teacherId: TeacherId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  dob: ISODate,
  address: z.string().nullable(),
  phone: Phone,
  teacherAadhar: z.string().nullable(),
  dateOfJoining: ISODate,
  about: z.string().nullable(),
  salaryPerMonth: z.number(),
  qualifications: z.string(),
  // NOTE: still free-text string[], matching Prisma's `Teacher.subjectHandled String[]` today.
  // ALIGNMENT_PLAN.md 2D/D1 (subjectHandled -> a real Subject relation, needed to make this a
  // validated multi-select instead of free text) is deferred to the Teachers-page rewrite.
  subjectHandled: z.array(z.string()),
  profilePhoto: z.string(),
  username: z.string(),
});
export type TeacherRecord = z.infer<typeof TeacherRecord>;

export const CreateTeacherBody = z.object({
  firstName: z
    .string({ message: 'First name is required.' })
    .min(2, 'First name must be at least 2 characters long.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters long.').optional(),
  dob: ISODate,
  address: z.string().min(10, 'Address must be at least 10 characters long.').optional(),
  phone: Phone,
  teacherAadhar: Aadhar.optional(),
  dateOfJoining: ISODate,
  about: z.string().min(20, 'About section must be at least 20 characters long.').optional(),
  salaryPerMonth: z
    .number({ message: 'Salary is required.' })
    .positive('Salary must be a positive number.'),
  qualifications: z
    .string({ message: 'Qualifications are required.' })
    .min(2, 'Qualifications must be at least 2 characters long.'),
  // Renamed from the old `subjectsHandled` (ALIGNMENT_PLAN.md 2B/N5) to match the DB column name
  // and every response — one name for this field everywhere, not two.
  subjectHandled: z
    .array(z.string().min(2, 'Each subject must be at least 2 characters long.'), {
      message: 'Subjects handled are required.',
    })
    .min(1, 'At least one subject must be provided.'),
  profilePhoto: ProfilePhotoUrl.optional(),
});
export type CreateTeacherBody = z.infer<typeof CreateTeacherBody>;

export const UpdateTeacherBody = CreateTeacherBody.partial();
export type UpdateTeacherBody = z.infer<typeof UpdateTeacherBody>;

export const DeleteTeacherResponse = z.object({ teacherId: TeacherId });

// See `ResetStudentPasswordResponse` (contracts/src/admin/student.ts) for why this is a
// show-once-to-the-admin generated password rather than an email flow.
export const ResetTeacherPasswordResponse = z.object({
  username: z.string(),
  temporaryPassword: z.string(),
});
export type ResetTeacherPasswordResponse = z.infer<typeof ResetTeacherPasswordResponse>;

export const TeacherListQuery = PageQuery.extend({
  sortBy: z.enum(['firstName', 'dateOfJoining', 'salaryPerMonth', 'teacherId']).optional(),
});
export type TeacherListQuery = z.infer<typeof TeacherListQuery>;

export const adminTeacherContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/teacher',
    query: TeacherListQuery,
    response: paginatedResponse(TeacherRecord),
  },
  detail: {
    method: 'GET',
    path: '/admin/teacher/:teacherId',
    params: z.object({ teacherId: TeacherId }),
    response: TeacherRecord,
  },
  create: {
    method: 'POST',
    path: '/admin/teacher',
    body: CreateTeacherBody,
    response: TeacherRecord,
    successStatus: 201,
    summary: 'Also creates the linked login User with a generated TCH######## username.',
  },
  update: {
    method: 'PUT',
    path: '/admin/teacher/:teacherId',
    params: z.object({ teacherId: TeacherId }),
    body: UpdateTeacherBody,
    response: TeacherRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/teacher/:teacherId',
    params: z.object({ teacherId: TeacherId }),
    response: DeleteTeacherResponse,
    successStatus: 202,
  },
  resetPassword: {
    method: 'POST',
    path: '/admin/teacher/:teacherId/reset-password',
    params: z.object({ teacherId: TeacherId }),
    response: ResetTeacherPasswordResponse,
    successStatus: 201,
    summary: 'Generates and sets a new random temporary password, returned once in the response.',
  },
} as const);
