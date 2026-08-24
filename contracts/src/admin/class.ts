import { z } from 'zod';
import { defineContract } from '../envelope';
import { ClassName, ObjectId, Section, Session } from '../primitives';

export const ClassRecord = z.object({
  id: ObjectId,
  className: ClassName,
  section: Section,
  session: Session,
  // D5 (ALIGNMENT_PLAN.md 2D/P3) — `false` for every class that predates this field (Prisma
  // default, no backfill needed). Set once every active student has been promoted out via
  // `POST /admin/academic/promote`.
  isArchived: z.boolean(),
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
} as const);
