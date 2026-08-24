import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import type { PromoteClassBody, PromoteClassResponse } from '@schoolerp/contracts';
import { ACTIVE_STUDENT_STATUS_FILTER } from '../helpers';

export class AdminPromotionService {
  static async promote(data: PromoteClassBody): Promise<PromoteClassResponse> {
    const fromClass = await prisma.class.findUnique({ where: { id: data.fromClassId } });
    if (!fromClass) {
      throw new NotFoundError('Source class not found.');
    }

    if (
      fromClass.className === data.toClassName &&
      fromClass.section === data.toSection &&
      fromClass.session === data.toSession
    ) {
      throw new ValidationError('The target class must differ from the source class.');
    }

    // Find-or-create the target class — a promotion run is the normal way a "next session's"
    // class comes into existence, same as `AdminClassService.createClass` but idempotent: running
    // promotion twice against the same target (e.g. a retry after some students failed) reuses
    // the class instead of hitting the unique-constraint error `createClass` would throw.
    let toClass = await prisma.class.findUnique({
      where: {
        className_section_session: {
          className: data.toClassName,
          section: data.toSection,
          session: data.toSession,
        },
      },
    });
    if (!toClass) {
      toClass = await prisma.class.create({
        data: { className: data.toClassName, section: data.toSection, session: data.toSession },
      });
    }

    const graduatingIds = new Set(data.graduatingStudentIds ?? []);

    const activeStudents = await prisma.student.findMany({
      where: { classId: fromClass.id, ...ACTIVE_STUDENT_STATUS_FILTER },
      select: { id: true, studentId: true, rollNo: true },
    });

    let promotedCount = 0;
    let graduatedCount = 0;
    const failures: { studentId: string; message: string }[] = [];

    // Sequential — each student is an independent write and a roll-number collision must fail
    // only that student, not the batch (same partial-success reasoning as bulk import).
    for (const student of activeStudents) {
      try {
        if (graduatingIds.has(student.studentId)) {
          await prisma.student.update({
            where: { id: student.id },
            data: { status: 'Graduated' },
          });
          graduatedCount += 1;
        } else {
          await prisma.student.update({
            where: { id: student.id },
            data: { classId: toClass.id },
          });
          promotedCount += 1;
        }
      } catch (_e) {
        failures.push({
          studentId: student.studentId,
          message: `Roll number ${student.rollNo} already exists in the target class.`,
        });
      }
    }

    // Archive the source class only once nothing active is left in it — a partial promotion
    // (some students failed on a roll-number collision) leaves it live so those students are
    // still visible/actionable from a non-archived class.
    const remainingActive = await prisma.student.count({
      where: { classId: fromClass.id, ...ACTIVE_STUDENT_STATUS_FILTER },
    });
    const archivedFromClass =
      remainingActive === 0 && !fromClass.isArchived
        ? await prisma.class.update({ where: { id: fromClass.id }, data: { isArchived: true } })
        : fromClass;

    return {
      fromClass: {
        id: archivedFromClass.id,
        className: archivedFromClass.className,
        section: archivedFromClass.section,
        // `?? false` — see `AdminClassService.getClasses` on why a legacy document can read back
        // `undefined` here.
        isArchived: archivedFromClass.isArchived ?? false,
      },
      toClass: {
        id: toClass.id,
        className: toClass.className,
        section: toClass.section,
        session: toClass.session,
      },
      promotedCount,
      graduatedCount,
      failures,
    };
  }
}
