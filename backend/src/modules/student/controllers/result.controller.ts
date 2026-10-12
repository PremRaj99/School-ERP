import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { toISODate } from '@/shared/helpers/isoDate';
import { buildReportCards } from '@/shared/helpers/reportCard';

export const getResult = defineRoute(studentContract.result, async ({ params, user }) => {
  const student = await prisma.student.findUnique({
    where: { userId: user!.id },
    select: {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      rollNo: true,
      classId: true,
    },
  });
  if (!student) {
    throw new NotFoundError();
  }

  const examWithResults = await prisma.exam.findUnique({
    where: { id: params.examId, classId: student.classId, isResultDecleared: true },
    select: {
      id: true,
      title: true,
      dateFrom: true,
      dateTo: true,
      class: { select: { className: true, section: true } },
    },
  });

  if (!examWithResults) {
    throw new NotFoundError();
  }

  const results = await prisma.examResult.findMany({
    where: { studentId: student.id, examSubject: { examId: params.examId } },
    select: {
      marksObtained: true,
      grade: true,
      remark: true,
      examSubject: {
        select: {
          date: true,
          fullMarks: true,
          subject: { select: { subjectCode: true, subjectName: true } },
        },
      },
    },
  });

  return {
    id: examWithResults.id,
    dateFrom: toISODate(examWithResults.dateFrom),
    dateTo: examWithResults.dateTo ? toISODate(examWithResults.dateTo) : null,
    title: examWithResults.title,
    studentId: student.studentId,
    firstName: student.firstName,
    lastName: student.lastName,
    className: examWithResults.class.className,
    section: examWithResults.class.section,
    rollNo: student.rollNo,
    marks: results.map((r) => ({
      subjectCode: r.examSubject.subject.subjectCode,
      subjectName: r.examSubject.subject.subjectName,
      date: toISODate(r.examSubject.date),
      marksObtained: r.marksObtained,
      fullMarks: r.examSubject.fullMarks,
      grade: r.grade,
      remark: r.remark,
    })),
  };
});

/**
 * The student's own report card for a declared exam — either one held for their current class, or
 * one they have marks in (a past class they've since been promoted out of).
 */
export const getReportCard = defineRoute(studentContract.reportCard, async ({ params, user }) => {
  const student = await prisma.student.findUnique({
    where: { userId: user!.id },
    select: { id: true, classId: true },
  });
  if (!student) {
    throw new NotFoundError();
  }

  const exam = await prisma.exam.findFirst({
    where: {
      id: params.examId,
      isResultDecleared: true,
      OR: [
        { classId: student.classId },
        { examSubjects: { some: { examResults: { some: { studentId: student.id } } } } },
      ],
    },
    select: { id: true },
  });
  if (!exam) {
    throw new NotFoundError();
  }

  const reportCards = await buildReportCards(exam.id, student.id);
  if (reportCards.students.length === 0) {
    throw new NotFoundError();
  }
  return reportCards;
});
