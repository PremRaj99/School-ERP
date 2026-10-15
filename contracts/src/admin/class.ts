import { z } from 'zod';
import { defineContract } from '../envelope';
import { ClassName, ObjectId, Section, Session, SubjectCode } from '../primitives';

export const ClassRecord = z.object({
  id: ObjectId,
  className: ClassName,
  section: Section,
  session: Session,
  // D5 (ALIGNMENT_PLAN.md 2D/P3) — `false` for every class that predates this field (Prisma
  // default, no backfill needed). Set once every active student has been promoted out via
  // `POST /admin/academic/promote`.
  isArchived: z.boolean(),
  // Active students currently in this class — only filled in by the list endpoint.
  studentCount: z.number().int().nonnegative().optional(),
});
export type ClassRecord = z.infer<typeof ClassRecord>;

export const CreateClassBody = z.object({
  className: ClassName,
  section: Section,
  session: Session,
});
export type CreateClassBody = z.infer<typeof CreateClassBody>;

export const UpdateClassBody = CreateClassBody.partial();
export type UpdateClassBody = z.infer<typeof UpdateClassBody>;

export const DeleteClassResponse = z.object({ id: ObjectId });

export const ClassListQuery = z.object({
  // Omitted -> service excludes archived classes, same "don't clutter the default view" rule as
  // `StudentListQuery.status` — pass `true` to see them (e.g. a class-history lookup).
  includeArchived: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});
export type ClassListQuery = z.infer<typeof ClassListQuery>;

// A subject assigned to one class section. `scheduledPeriods` counts that subject's slots in the
// class's timetable — a subject with any scheduled period can't be unassigned until those slots
// are moved to another subject.
export const ClassSubjectRecord = z.object({
  subjectCode: SubjectCode,
  subjectName: z.string(),
  scheduledPeriods: z.number().int().nonnegative(),
});
export type ClassSubjectRecord = z.infer<typeof ClassSubjectRecord>;

// Replaces the class's whole assignment set — the UI is a checklist, so sending the final list is
// simpler than add/remove calls per subject.
export const SetClassSubjectsBody = z.object({
  subjectCodes: z.array(SubjectCode),
});
export type SetClassSubjectsBody = z.infer<typeof SetClassSubjectsBody>;

export const adminClassContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/class',
    query: ClassListQuery,
    response: z.array(ClassRecord),
  },
  create: {
    method: 'POST',
    path: '/admin/class',
    body: CreateClassBody,
    response: ClassRecord,
    successStatus: 201,
  },
  update: {
    method: 'PUT',
    path: '/admin/class/:classId',
    params: z.object({ classId: ObjectId }),
    body: UpdateClassBody,
    response: ClassRecord,
    successStatus: 202,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/class/:classId',
    params: z.object({ classId: ObjectId }),
    response: DeleteClassResponse,
    successStatus: 202,
  },
  listSubjects: {
    method: 'GET',
    path: '/admin/class/:classId/subjects',
    params: z.object({ classId: ObjectId }),
    response: z.array(ClassSubjectRecord),
    summary: 'Subjects assigned to a class (explicitly, or via a timetable slot).',
  },
  setSubjects: {
    method: 'PUT',
    path: '/admin/class/:classId/subjects',
    params: z.object({ classId: ObjectId }),
    body: SetClassSubjectsBody,
    response: z.array(ClassSubjectRecord),
    successStatus: 202,
    summary: 'Replace the set of subjects assigned to a class.',
  },
} as const);
