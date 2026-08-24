import prisma from '@/core/db';
import type { CreateExamBody, ExamRecord } from '@schoolerp/contracts';
import { getCurrentSessionYear } from './getCurrentSessionYear';
import { fromISODate, toISODate } from './isoDate';
import { NotFoundError } from '@/core/errors';

export const storeExamData = async (data: CreateExamBody): Promise<ExamRecord[]> => {
  const currentSession = getCurrentSessionYear();

  return await prisma.$transaction(async (tx) => {
    const { title, dateFrom, dateTo, exams } = data;
    const created: ExamRecord[] = [];

    for (const examData of exams) {
      const { className, section, subjects } = examData;

      // Was `findFirst` with no session filter, and silently created the class with a
      // hard-coded `session: '2025-2026'` if missing — wrong every session after 2026, and wrong
      // right now too if this className+section already exists under a different session
      // (ALIGNMENT_PLAN.md 2A/B9). An exam is for an existing class, in the current session, full
      // stop — if that class doesn't exist yet, the admin creates it explicitly first.
      const classRecord = await tx.class.findUnique({
        where: { className_section_session: { className, section, session: currentSession } },
        select: { id: true },
      });

      if (!classRecord) {
        throw new NotFoundError(
          `Class ${className}-${section} for session ${currentSession} does not exist. Create it first.`,
        );
      }

      const newExam = await tx.exam.create({
        data: {
          title,
          dateFrom: fromISODate(dateFrom),
          dateTo: fromISODate(dateTo),
          classId: classRecord.id,
          isResultDecleared: false,
        },
      });

      const subjectCodes = subjects.map((s) => s.subjectCode);
      const subjectRecords = await tx.timeTable.findMany({
        where: {
          class: { className, section },
          subject: { subjectCode: { in: subjectCodes } },
        },
        select: { subject: true, teacherId: true },
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
            date: fromISODate(subjectData.date),
            isMarked: false,
          },
        });
      }

      created.push({
        id: newExam.id,
        title: newExam.title,
        className,
        section,
        dateFrom: toISODate(newExam.dateFrom),
        dateTo: newExam.dateTo ? toISODate(newExam.dateTo) : null,
        isResultDecleared: newExam.isResultDecleared,
      });
    }

    return created;
  });
};
