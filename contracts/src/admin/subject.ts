import { z } from 'zod';
import { defineContract } from '../envelope';
import { ClassName, SubjectCode } from '../primitives';

export const SubjectRecord = z.object({
  subjectCode: SubjectCode,
  subjectName: z.string(),
});
export type SubjectRecord = z.infer<typeof SubjectRecord>;

export const CreateSubjectBody = z.object({
  subjectName: z
    .string({ message: 'Subject name is required' })
    .trim()
    .min(2, 'Subject name must be at least 2 characters long.'),
  subjectCode: SubjectCode.optional(),
});
export type CreateSubjectBody = z.infer<typeof CreateSubjectBody>;

export const UpdateSubjectBody = z.object({
  subjectName: z
    .string({ message: 'Subject name is required' })
    .trim()
    .min(2, 'Subject name must be at least 2 characters long.'),
});
export type UpdateSubjectBody = z.infer<typeof UpdateSubjectBody>;

export const DeleteSubjectResponse = z.object({ subjectCode: SubjectCode });

export const GroupedSubjects = z.object({
  assignedSubjects: z.array(
    z.object({
      className: ClassName,
      subjects: z.array(SubjectRecord),
    }),
  ),
  unassignedSubjects: z.array(SubjectRecord),
});
export type GroupedSubjects = z.infer<typeof GroupedSubjects>;

export const adminSubjectContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/subject',
    response: z.array(SubjectRecord),
  },
  groupedByClass: {
    method: 'GET',
    path: '/admin/subject/get-all-class-subject',
    response: GroupedSubjects,
    summary:
      'Subjects grouped per class for the current session, plus subjects assigned to no class.',
  },
  create: {
    method: 'POST',
    path: '/admin/subject',
    body: CreateSubjectBody,
    response: SubjectRecord,
    successStatus: 201,
  },
  update: {
    method: 'PUT',
    path: '/admin/subject/:subjectCode',
    params: z.object({ subjectCode: SubjectCode }),
    body: UpdateSubjectBody,
    response: SubjectRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/subject/:subjectCode',
    params: z.object({ subjectCode: SubjectCode }),
    response: DeleteSubjectResponse,
    successStatus: 202,
  },
} as const);
