import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import { generateSubjectCode, getGroupedSubject } from '../helpers';
import { CreateSubjectInput, UpdateSubjectInput } from '../types';

export class AdminSubjectService {
  static async getAllClassSubjects() {
    return getGroupedSubject();
  }

  static async createSubject(data: CreateSubjectInput) {
    const classRecord = await prisma.class.findFirst({
      where: { className: data.className },
    });

    if (!classRecord) {
      throw new NotFoundError();
    }

    const subjectCode = generateSubjectCode(data.subjectName);

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

  static async deleteSubject(subjectCode: string) {
    try {
      await prisma.subject.delete({
        where: { subjectCode },
      });
    } catch (_e) {
      throw new NotFoundError();
    }
  }
}
