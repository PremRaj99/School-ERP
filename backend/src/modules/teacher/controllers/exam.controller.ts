import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { teacherContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { resolveTeacherId } from '@/core/middlewares/auth.middleware';
import { toISODate } from '@/shared/helpers/isoDate';

// Both routes below were unscoped — every teacher saw every exam (including class-groups and
// subjects they have no part in), not just the ones with a subject assigned to them. Same class
// of ownership gap as the attendance module's A2/A3/A4 fixes (ALIGNMENT_PLAN.md), just not caught
// until the Teacher portal pages were actually wired up (Phase 6).

export const getExam = defineRoute(teacherContract.exams, async ({ req }) => {
  const teacherId = await resolveTeacherId(req);
  const exams = await prisma.exam.findMany({
    where: { examSubjects: { some: { teacherId } } },
    include: { class: true },
  });

  return exams.map((e) => ({
    id: e.id,
    className: e.class.className,
    section: e.class.section,
    dateFrom: toISODate(e.dateFrom),
    dateTo: e.dateTo ? toISODate(e.dateTo) : null,
    title: e.title,
    isResultDecleared: e.isResultDecleared,
  }));
});

export const getExamSubject = defineRoute(teacherContract.examDetail, async ({ params, req }) => {
  const teacherId = await resolveTeacherId(req);
  const exam = await prisma.exam.findUnique({
    where: { id: params.examId },
    include: {
      class: true,
      examSubjects: { where: { teacherId }, include: { subject: true } },
    },
  });

  if (!exam || exam.examSubjects.length === 0) {
    throw new NotFoundError();
  }

  return {
    id: exam.id,
    className: exam.class.className,
    section: exam.class.section,
    dateFrom: toISODate(exam.dateFrom),
    dateTo: exam.dateTo ? toISODate(exam.dateTo) : null,
    title: exam.title,
    isResultDecleared: exam.isResultDecleared,
    // `subjectId` is what `GET/POST/PUT /teacher/result/:examId/:subjectId` actually expects
    // in the URL — it used to be missing, only the ExamSubject's own id (`examSubjectId`) was
    // returned, so the frontend had no correct id to link the marks-entry page with
    // (ALIGNMENT_PLAN.md 2A/B12).
    subjects: exam.examSubjects.map((s) => ({
      examSubjectId: s.id,
      subjectId: s.subjectId,
      subjectName: s.subject.subjectName,
      subjectCode: s.subject.subjectCode,
      date: toISODate(s.date),
      fullMarks: s.fullMarks,
      isMarked: s.isMarked,
    })),
  };
});
