import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import { CreateClassInput } from '../types';

export class AdminClassService {
  static async getClasses() {
    return await prisma.class.findMany();
  }

  static async createClass(data: CreateClassInput) {
    try {
      return await prisma.class.create({
        data: {
          className: data.className,
          section: data.section,
          session: data.session,
        },
      });
    } catch (_e) {
      throw new ValidationError('already exist');
    }
  }

  static async deleteClass(classId: string) {
    try {
      await prisma.class.delete({
        where: { id: classId },
      });
    } catch (_error) {
      throw new NotFoundError();
    }
  }
}
