import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import { storeExamData } from '../helpers';
import { z } from 'zod';
import { CreateExamSchema } from '../types';

export class AdminExamService {
  static async getExams() {
    return await prisma.exam.findMany({
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
  }

  static async createExam(data: z.infer<typeof CreateExamSchema>) {
    try {
      await storeExamData(data);
    } catch (error) {
      throw new ValidationError();
    }
  }

  static async deleteExam(examId: string) {
    try {
      await prisma.exam.delete({
        where: { id: examId },
      });
    } catch (e) {
      throw new NotFoundError();
    }
  }
}
