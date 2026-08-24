import { z } from 'zod';
import { defineContract } from '../envelope';
import { ClassName, ObjectId, Section, Session, StudentId } from '../primitives';

/**
 * Session promotion (ALIGNMENT_PLAN.md P3, needs D5). Moves every *active* student in
 * `fromClassId` into a target class — created if it doesn't already exist — except students
 * listed in `graduatingStudentIds`, who get `status: 'Graduated'` instead and are left behind
 * (their fee/exam history stays attached to the old class, which is what should happen).
 * `fromClassId` is archived once every active student has left it. Partial failure (e.g. a roll
 * number collision in the target class) is reported per-student, not atomic — same reasoning as
 * bulk student import: don't let one bad row block 39 good ones.
 */
export const PromoteClassBody = z.object({
  fromClassId: ObjectId,
  toClassName: ClassName,
  toSection: Section,
  toSession: Session,
  graduatingStudentIds: z.array(StudentId).optional(),
});
export type PromoteClassBody = z.infer<typeof PromoteClassBody>;

export const PromoteClassResponse = z.object({
  fromClass: z.object({
    id: ObjectId,
    className: ClassName,
    section: Section,
    isArchived: z.boolean(),
  }),
  toClass: z.object({ id: ObjectId, className: ClassName, section: Section, session: Session }),
  promotedCount: z.number().int(),
  graduatedCount: z.number().int(),
  failures: z.array(z.object({ studentId: StudentId, message: z.string() })),
});
export type PromoteClassResponse = z.infer<typeof PromoteClassResponse>;

export const adminPromotionContract = defineContract({
  promote: {
    method: 'POST',
    path: '/admin/academic/promote',
    body: PromoteClassBody,
    response: PromoteClassResponse,
    successStatus: 201,
  },
} as const);
