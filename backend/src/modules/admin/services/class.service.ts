import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import type {
  ClassListQuery,
  ClassRecord,
  CreateClassBody,
  UpdateClassBody,
} from '@schoolerp/contracts';

export class AdminClassService {
  static async getClasses(query: ClassListQuery): Promise<ClassRecord[]> {
    // Not `{ isArchived: false }` — same legacy-document reasoning as `AdminStudentService`'s
    // status filter: `isArchived` is a brand-new field, so every pre-D5 Class document has no
    // such key in Mongo at all, and a strict equality filter would exclude every one of them.
    // `{ not: true }` matches both an explicit `false` and a missing field.
    const classes = await prisma.class.findMany({
      where: query.includeArchived ? {} : { isArchived: { not: true } },
    });
    return classes.map((c) => ({ ...c, isArchived: c.isArchived ?? false }));
  }

  static async createClass(data: CreateClassBody): Promise<ClassRecord> {
    try {
      return await prisma.class.create({
        data: {
          className: data.className,
          section: data.section,
          session: data.session,
        },
      });
    } catch (_e) {
      throw new ValidationError('A class with this name, section, and session already exists.');
    }
  }

  static async updateClass(classId: string, data: UpdateClassBody): Promise<ClassRecord> {
    try {
      const updated = await prisma.class.update({
        where: { id: classId },
        data: {
          ...(data.className !== undefined ? { className: data.className } : {}),
          ...(data.section !== undefined ? { section: data.section } : {}),
          ...(data.session !== undefined ? { session: data.session } : {}),
        },
      });
      // See `getClasses` — an update doesn't backfill `isArchived` on a legacy document that
      // never had it, so it can still come back `undefined` here.
      return { ...updated, isArchived: updated.isArchived ?? false };
    } catch (e) {
      // Prisma throws P2025 (not found) or P2002 (the className/section/session unique
      // constraint) here — both surface as a 4xx either way, so a single catch is fine; the
      // message just needs to not claim "not found" when it was actually a duplicate.
      if (e instanceof Error && 'code' in e && e.code === 'P2002') {
        throw new ValidationError('A class with this name, section, and session already exists.');
      }
      throw new NotFoundError();
    }
  }

  static async deleteClass(classId: string): Promise<{ id: string }> {
    try {
      await prisma.class.delete({ where: { id: classId } });
    } catch (_error) {
      throw new NotFoundError();
    }
    return { id: classId };
  }
}
