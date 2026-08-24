import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { toISODate } from '@/shared/helpers/isoDate';

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
