import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import type {
  CreateSubjectBody,
  GroupedSubjects,
  SubjectRecord,
  UpdateSubjectBody,
} from '@schoolerp/contracts';
import { generateSubjectCode, getGroupedSubject } from '../helpers';

export class AdminSubjectService {
  static async getAllClassSubjects(): Promise<GroupedSubjects> {
    return getGroupedSubject();
  }

  static async getSubjects(): Promise<SubjectRecord[]> {
    const subjects = await prisma.subject.findMany();
    return subjects.map((s) => ({ subjectCode: s.subjectCode, subjectName: s.subjectName }));
  }

  static async createSubject(data: CreateSubjectBody): Promise<SubjectRecord> {
    const subjectCode = data.subjectCode || generateSubjectCode(data.subjectName);

    try {
      const subject = await prisma.subject.create({
        data: {
          subjectCode,
          subjectName: data.subjectName,
        },
      });
      return { subjectCode: subject.subjectCode, subjectName: subject.subjectName };
    } catch (_e) {
      throw new ValidationError('A subject with this code already exists.');
    }
  }

  static async updateSubject(subjectCode: string, data: UpdateSubjectBody): Promise<SubjectRecord> {
    try {
      const subject = await prisma.subject.update({
        where: { subjectCode },
        data: { subjectName: data.subjectName },
      });
      return { subjectCode: subject.subjectCode, subjectName: subject.subjectName };
    } catch (_error) {
      throw new NotFoundError();
    }
  }

  static async deleteSubject(subjectCode: string): Promise<{ subjectCode: string }> {
    try {
      await prisma.subject.delete({ where: { subjectCode } });
    } catch (_e) {
      throw new NotFoundError();
    }
    return { subjectCode };
  }
}
