import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import { storeExamData } from '../helpers';
import { z } from 'zod';
import { CreateExamSchema } from '../types';

export class AdminExamService {
  static async getExams() {
    const exams = await prisma.exam.findMany({
      select: {
        id: true,
        title: true,
        dateFrom: true,
        dateTo: true,
        isResultDecleared: true,
        class: {
          select: {
            className: true,
            section: true,
          },
        },
      },
    });

    return exams.map((exam) => ({
      ...exam,
      dateFrom: exam.dateFrom.toISOString().split('T')[0],
      dateTo: exam.dateTo?.toISOString().split('T')[0],
    }));
  }

  static async createExam(data: z.infer<typeof CreateExamSchema>) {
    try {
      await storeExamData(data);
    } catch (_error) {
      throw new ValidationError();
    }
  }

  static async deleteExam(examId: string) {
    try {
      await prisma.exam.delete({
        where: { id: examId },
      });
    } catch (_e) {
      throw new NotFoundError();
    }
  }
}
