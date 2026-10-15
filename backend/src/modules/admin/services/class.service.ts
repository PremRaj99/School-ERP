import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import type {
  ClassListQuery,
  ClassRecord,
  ClassSubjectRecord,
  CreateClassBody,
  SetClassSubjectsBody,
  UpdateClassBody,
} from '@schoolerp/contracts';
import { normalizeClassName } from '@schoolerp/contracts';
import { ACTIVE_STUDENT_STATUS_FILTER } from '@/shared/helpers/activeStudentFilter';

export class AdminClassService {
  static async getClasses(query: ClassListQuery): Promise<ClassRecord[]> {
    // Not `{ isArchived: false }` — same legacy-document reasoning as `AdminStudentService`'s
    // status filter: `isArchived` is a brand-new field, so every pre-D5 Class document has no
    // such key in Mongo at all, and a strict equality filter would exclude every one of them.
    // `{ not: true }` matches both an explicit `false` and a missing field.
    const classes = await prisma.class.findMany({
      where: query.includeArchived ? {} : { isArchived: { not: true } },
    });
    const counts = await prisma.student.groupBy({
      by: ['classId'],
      where: { classId: { in: classes.map((c) => c.id) }, ...ACTIVE_STUDENT_STATUS_FILTER },
      _count: { _all: true },
    });
    const countByClass = new Map(counts.map((row) => [row.classId, row._count._all]));
    return classes.map((c) => ({
      ...c,
      isArchived: c.isArchived ?? false,
      studentCount: countByClass.get(c.id) ?? 0,
    }));
  }

  static async createClass(data: CreateClassBody): Promise<ClassRecord> {
    try {
      return await prisma.class.create({
        data: {
          className: normalizeClassName(data.className),
          section: data.section.toUpperCase(),
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
          ...(data.className !== undefined
            ? { className: normalizeClassName(data.className) }
            : {}),
          ...(data.section !== undefined ? { section: data.section.toUpperCase() } : {}),
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

  // A subject counts as assigned if it has an explicit `ClassSubject` link OR is scheduled in the
  // class's timetable — classes set up before explicit assignment existed only have the latter.
  static async getClassSubjects(classId: string): Promise<ClassSubjectRecord[]> {
    const cls = await prisma.class.findUnique({ where: { id: classId }, select: { id: true } });
    if (!cls) throw new NotFoundError('Class not found.');

    const [links, slots] = await Promise.all([
      prisma.classSubject.findMany({
        where: { classId },
        select: { subject: { select: { subjectCode: true, subjectName: true } } },
      }),
      prisma.timeTable.findMany({
        where: { classId },
        select: { subject: { select: { subjectCode: true, subjectName: true } } },
      }),
    ]);

    const byCode = new Map<string, ClassSubjectRecord>();
    for (const { subject } of links) {
      byCode.set(subject.subjectCode, { ...subject, scheduledPeriods: 0 });
    }
    for (const { subject } of slots) {
      const existing = byCode.get(subject.subjectCode);
      if (existing) existing.scheduledPeriods += 1;
      else byCode.set(subject.subjectCode, { ...subject, scheduledPeriods: 1 });
    }
    return [...byCode.values()].sort((a, b) => a.subjectName.localeCompare(b.subjectName));
  }

  static async setClassSubjects(
    classId: string,
    data: SetClassSubjectsBody,
  ): Promise<ClassSubjectRecord[]> {
    const current = await AdminClassService.getClassSubjects(classId);
    const wanted = [...new Set(data.subjectCodes)];

    const subjects = await prisma.subject.findMany({
      where: { subjectCode: { in: wanted } },
      select: { id: true, subjectCode: true },
    });
    const idByCode = new Map(subjects.map((s) => [s.subjectCode, s.id]));
    const unknown = wanted.filter((code) => !idByCode.has(code));
    if (unknown.length > 0) {
      throw new ValidationError(
        `Unknown subject code(s): ${unknown.join(', ')}.`,
        unknown.map((code) => ({ path: 'subjectCodes', message: `Unknown subject code ${code}.` })),
      );
    }

    const wantedSet = new Set(wanted);
    const stillScheduled = current.filter(
      (s) => s.scheduledPeriods > 0 && !wantedSet.has(s.subjectCode),
    );
    if (stillScheduled.length > 0) {
      throw new ValidationError(
        `Remove these subjects from the class timetable before unassigning them: ${stillScheduled
          .map((s) => s.subjectName)
          .join(', ')}.`,
      );
    }

    const wantedIds = wanted.map((code) => idByCode.get(code)!);
    await prisma.$transaction([
      prisma.classSubject.deleteMany({ where: { classId, subjectId: { notIn: wantedIds } } }),
      ...wantedIds.map((subjectId) =>
        prisma.classSubject.upsert({
          where: { classId_subjectId: { classId, subjectId } },
          create: { classId, subjectId },
          update: {},
        }),
      ),
    ]);

    return AdminClassService.getClassSubjects(classId);
  }
}
