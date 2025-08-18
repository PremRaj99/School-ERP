import prisma from "@repo/db";
import { CreateExamSchema } from "@repo/types";
import z from 'zod';
import { NotFoundError } from "@repo/errorhandler";

export const storeExamData = async (data: z.infer<typeof CreateExamSchema>) => {
    await prisma.$transaction(async (tx) => {
        const { title, dateFrom, dateTo, exams } = data;

        // Loop through each class/section combination provided in the input data.
        for (const examData of exams) {
            const { className, section, subjects } = examData;

            const classRecord = await tx.class.findFirst({
                where: {
                    className: className,
                    section: section,
                },
                select: { id: true },
            });

            if (!classRecord) {
                throw new NotFoundError()
            }

            const newExam = await tx.exam.create({
                data: {
                    title,
                    dateFrom,
                    dateTo,
                    classId: classRecord.id,
                    isResultDecleared: false,
                },
            });

            const subjectCodes = subjects.map(s => s.subjectCode);
            const subjectRecords = await tx.timeTable.findMany({
                where: {
                    class: {
                        className: className,
                        section: section
                    },
                    subject: {
                        subjectCode: { in: subjectCodes }
                    }
                },
                select: {
                    subject: true, teacherId: true
                }
            });

            // Create a Map for quick lookups to avoid nested loops.
            const subjectMap = new Map(subjectRecords.map(s => [s.subject.subjectCode, { id: s.subject.id, teacherId: s.teacherId, subjectCode: s.subject.subjectCode }]));

            // 4. Create each `ExamSubject` record.
            for (const subjectData of subjects) {
                const subjectInfo = subjectMap.get(subjectData.subjectCode);

                if (!subjectInfo) {
                    throw new Error(`Subject with code "${subjectData.subjectCode}" was not found.`);
                }
                if (!subjectInfo.teacherId) {
                    throw new Error(`A teacher has not been assigned to the subject "${subjectData.subjectCode}".`);
                }

                await tx.examSubject.create({
                    data: {
                        examId: newExam.id,
                        subjectId: subjectInfo.id,
                        teacherId: subjectInfo.teacherId, // Using the teacherId from the Subject model.
                        fullMarks: subjectData.fullMarks,
                        date: subjectData.date,
                        isMarked: false,
                    },
                });
            }
        }
    });
}