import prisma from '@/core/db';
import { CreateExamSchema } from '@/modules/admin/types';
import z from 'zod';
import { getDateString } from './getDateString';

export const storeExamData = async (data: z.infer<typeof CreateExamSchema>) => {
  await prisma.$transaction(async (tx) => {
    const { title, dateFrom, dateTo, exams } = data;

    for (const examData of exams) {
      const { className, section, subjects } = examData;

      let classRecord = await tx.class.findFirst({
        where: {
          className: className,
          section: section,
        },
        select: { id: true },
      });

      if (!classRecord) {
        classRecord = await tx.class.create({
          data: {
            className: className,
            section: section,
            session: '2025-2026',
          },
          select: { id: true },
        });
      }

      const newExam = await tx.exam.create({
        data: {
          title,
          dateFrom: getDateString(dateFrom),
          dateTo: getDateString(dateTo),
          classId: classRecord.id,
          isResultDecleared: false,
        },
      });

      const subjectCodes = subjects.map((s) => s.subjectCode);
      const subjectRecords = await tx.timeTable.findMany({
        where: {
          class: {
            className: className,
            section: section,
          },
          subject: {
            subjectCode: { in: subjectCodes },
          },
        },
        select: {
          subject: true,
          teacherId: true,
        },
      });

      const subjectMap = new Map<
        string,
        { id: string; teacherId: string | null; subjectCode: string }
      >(
        subjectRecords.map((s) => [
          s.subject.subjectCode,
          { id: s.subject.id, teacherId: s.teacherId, subjectCode: s.subject.subjectCode },
        ]),
      );

      for (const subjectData of subjects) {
        const subjectInfo = subjectMap.get(subjectData.subjectCode);

        if (!subjectInfo) {
          throw new Error(`Subject with code "${subjectData.subjectCode}" was not found.`);
        }
        if (!subjectInfo.teacherId) {
          throw new Error(
            `A teacher has not been assigned to the subject "${subjectData.subjectCode}".`,
          );
        }

        await tx.examSubject.create({
          data: {
            examId: newExam.id,
            subjectId: subjectInfo.id,
            teacherId: subjectInfo.teacherId,
            fullMarks: subjectData.fullMarks,
            date: getDateString(subjectData.date),
            isMarked: false,
          },
        });
      }
    }
  });
};
