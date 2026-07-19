import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { getMonthStartEnd } from '../helpers';
import { z } from 'zod';
import { CreateTeacherAttendanceSchema, UpdateTeacherAttendanceSchema } from '../types';

export class AdminTeacherAttendanceService {
  static async getTeacherAttendanceByDate(date: string) {
    const records = await prisma.teacherAttendance.findMany({
      where: { date },
      select: {
        id: true,
        date: true,
        status: true,
        teacher: {
          select: {
            teacherId: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const teachers = records.map((r) => ({
      id: r.id,
      teacherId: r.teacher.teacherId,
      firstName: r.teacher.firstName,
      lastName: r.teacher.lastName,
      status: r.status,
    }));

    return { date, teachers };
  }

  static async getTeacherAttendanceByMonth(teacherId: string, month: string) {
    const { startDate, endDate } = getMonthStartEnd(month);

    const teacher = await prisma.teacher.findUnique({
      where: { teacherId },
    });

    if (!teacher) {
      throw new NotFoundError();
    }

    const records = await prisma.teacherAttendance.findMany({
      where: {
        teacherId: teacher.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        status: true,
      },
    });

    return {
      teacherId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      attendance: records,
    };
  }

  static async markTeacherAttendance(
    date: string,
    attendance: z.infer<typeof CreateTeacherAttendanceSchema>,
  ) {
    await prisma.$transaction(async (tx) => {
      for (const item of attendance) {
        const teacher = await tx.teacher.findUnique({
          where: { teacherId: item.teacherId },
        });

        if (!teacher) {
          throw new NotFoundError();
        }

        await tx.teacherAttendance.upsert({
          where: {
            teacherId_date: {
              teacherId: teacher.id,
              date,
            },
          },
          update: {
            status: item.status,
          },
          create: {
            teacherId: teacher.id,
            date,
            status: item.status,
          },
        });
      }
    });
  }

  static async updateTeacherAttendance(attendance: z.infer<typeof UpdateTeacherAttendanceSchema>) {
    await prisma.$transaction(async (tx) => {
      for (const item of attendance) {
        await tx.teacherAttendance.update({
          where: { id: item.id },
          data: { status: item.status },
        });
      }
    });
  }
}
