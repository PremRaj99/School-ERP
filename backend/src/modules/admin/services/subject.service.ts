import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import { generateSubjectCode, getGroupedSubject } from '../helpers';
import { CreateSubjectInput, UpdateSubjectInput } from '../types';

export class AdminSubjectService {
  static async getAllClassSubjects() {
    return getGroupedSubject();
  }

  static async getSubjects() {
    return await prisma.subject.findMany();
  }

  static async createSubject(data: CreateSubjectInput) {
    const subjectCode = data.subjectCode || generateSubjectCode(data.subjectName);

    try {
      await prisma.subject.create({
        data: {
          subjectCode,
          subjectName: data.subjectName,
        },
      });
    } catch (_e) {
      throw new ValidationError();
    }
  }

  static async updateSubject(subjectCode: string, data: UpdateSubjectInput) {
    const newSubjectCode = generateSubjectCode(data.subjectName);

    try {
      await prisma.subject.update({
        where: { subjectCode },
        data: {
          subjectName: data.subjectName,
          subjectCode: newSubjectCode,
        },
      });
    } catch (_error) {
      throw new NotFoundError();
    }
  }

  static async deleteSubject(param: string) {
    try {
      if (/^[0-9a-fA-F]{24}$/.test(param)) {
        await prisma.subject.delete({
          where: { id: param },
        });
      } else {
        await prisma.subject.delete({
          where: { subjectCode: param },
        });
      }
    } catch (_e) {
      throw new NotFoundError();
    }
  }
}
