import prisma from '@/core/db';
import { DatabaseError, ForbiddenError, NotFoundError } from '@/core/errors';
import { teacherContract, type ResultSheet } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { getGrade } from '@/shared';
import { resolveTeacherId } from '@/core/middlewares/auth.middleware';
import { toISODate } from '@/shared/helpers/isoDate';

const loadResultSheet = async (examId: string, subjectId: string): Promise<ResultSheet> => {
  const examSubject = await prisma.examSubject.findFirst({
    where: { examId, subjectId },
    include: {
      exam: { include: { class: { include: { students: { orderBy: { rollNo: 'asc' } } } } } },
      subject: true,
      examResults: {
        include: { student: true },
        orderBy: { student: { rollNo: 'asc' } },
      },
    },
  });

  if (!examSubject) {
    throw new NotFoundError('Result for the specified exam and subject not found.');
  }

  return {
    id: examSubject.exam.id,
    dateFrom: toISODate(examSubject.exam.dateFrom),
    dateTo: examSubject.exam.dateTo ? toISODate(examSubject.exam.dateTo) : null,
    title: examSubject.exam.title,
    className: examSubject.exam.class.className,
    section: examSubject.exam.class.section,
    subjectCode: examSubject.subject.subjectCode,
    subjectName: examSubject.subject.subjectName,
    fullMarks: examSubject.fullMarks,
    isMarked: examSubject.isMarked,
    marks:
      examSubject.examResults.length > 0
        ? examSubject.examResults.map((result) => ({
            id: result.id,
            studentId: result.studentId,
            firstName: result.student.firstName,
            lastName: result.student.lastName,
            date: toISODate(examSubject.date),
            rollNo: result.student.rollNo,
            marksObtained: result.marksObtained,
            grade: result.grade,
            remark: result.remark,
          }))
        : examSubject.exam.class.students.map((student) => ({
            id: null,
            studentId: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            date: toISODate(examSubject.date),
            rollNo: student.rollNo,
            marksObtained: 0,
            grade: '',
            remark: null,
          })),
  };
};

export const getResult = defineRoute(teacherContract.getResult, async ({ params, req }) => {
  // Was unscoped — any teacher could read another teacher's subject marks by guessing/enumerating
  // examId/subjectId. Same ownership gap `updateResult` below already guards against.
  const teacherId = await resolveTeacherId(req);
  const examSubject = await prisma.examSubject.findUnique({
    where: { examId_subjectId: { examId: params.examId, subjectId: params.subjectId } },
    select: { teacherId: true },
  });
  if (!examSubject) {
    throw new NotFoundError('Result for the specified exam and subject not found.');
  }
  if (examSubject.teacherId !== teacherId) {
    throw new ForbiddenError('You are not assigned to mark this subject.');
  }
  return loadResultSheet(params.examId, params.subjectId);
});

export const createResult = defineRoute(
  teacherContract.submitResult,
  async ({ params, body, req }) => {
    const { examId, subjectId } = params;
    // Was `req.user?.id` — the User id, not the Teacher id, so this `where` clause could never
    // match and submitting marks always failed (ALIGNMENT_PLAN.md 2A/B3).
    const teacherId = await resolveTeacherId(req);

    try {
      await prisma.$transaction(async (txn) => {
        const examSubject = await txn.examSubject.update({
          where: { examId_subjectId: { examId, subjectId }, teacherId },
          data: { isMarked: true },
        });

        await txn.examResult.createMany({
          data: body.map((d) => ({
            // Was also passing `subjectId` here — not a field on ExamResult, so this create
            // always threw and got swallowed as a generic DatabaseError (ALIGNMENT_PLAN.md 2A/B5).
            examSubjectId: examSubject.id,
            studentId: d.studentId,
            marksObtained: d.marksObtained,
            grade: getGrade(examSubject.fullMarks, d.marksObtained),
            remark: d.remark,
          })),
        });
      });
    } catch (_error) {
      throw new DatabaseError();
    }

    return loadResultSheet(examId, subjectId);
  },
);

export const updateResult = defineRoute(
  teacherContract.updateResult,
  async ({ params, body, req }) => {
    const { examId, subjectId } = params;
    const teacherId = await resolveTeacherId(req);

    const examSubject = await prisma.examSubject.findUnique({
      where: { examId_subjectId: { examId, subjectId } },
    });

    if (!examSubject) {
      throw new NotFoundError();
    }

    // Was missing entirely — any teacher could edit marks for a subject they don't own
    // (ALIGNMENT_PLAN.md 2A/A4).
    if (examSubject.teacherId !== teacherId) {
      throw new ForbiddenError('You are not assigned to mark this subject.');
    }

    try {
      await prisma.$transaction(async (txn) => {
        await Promise.all(
          body.map((data) =>
            txn.examResult.update({
              where: {
                examSubjectId_studentId: {
                  examSubjectId: examSubject.id,
                  studentId: data.studentId,
                },
              },
              data: {
                marksObtained: data.marksObtained,
                grade: getGrade(examSubject.fullMarks, data.marksObtained),
                remark: data.remark,
              },
            }),
          ),
        );
      });
    } catch (_error) {
      throw new DatabaseError();
    }

    return loadResultSheet(examId, subjectId);
  },
);
