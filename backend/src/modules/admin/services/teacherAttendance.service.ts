import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import type {
  MarkTeacherAttendanceBody,
  TeacherAttendanceByDate,
  TeacherAttendanceByMonth,
  TeacherAttendanceRow,
  UpdateTeacherAttendanceBody,
} from '@schoolerp/contracts';
import { fromISODate, monthStartEndFromISO, toISODate } from '@/shared/helpers/isoDate';

export class AdminTeacherAttendanceService {
  static async getTeacherAttendanceByDate(date: string): Promise<TeacherAttendanceByDate> {
    const records = await prisma.teacherAttendance.findMany({
      where: { date: fromISODate(date) },
      select: {
        id: true,
        status: true,
        teacher: { select: { teacherId: true, firstName: true, lastName: true } },
      },
    });

    return {
      date,
      teachers: records.map((r) => ({
        id: r.id,
        teacherId: r.teacher.teacherId,
        firstName: r.teacher.firstName,
        lastName: r.teacher.lastName,
        status: r.status,
      })),
    };
  }

  static async getTeacherAttendanceByMonth(
    teacherId: string,
    month: string,
  ): Promise<TeacherAttendanceByMonth> {
    const { startDate, endDate } = monthStartEndFromISO(month);

    const teacher = await prisma.teacher.findUnique({ where: { teacherId } });
    if (!teacher) {
      throw new NotFoundError();
    }

    const records = await prisma.teacherAttendance.findMany({
      where: { teacherId: teacher.id, date: { gte: startDate, lte: endDate } },
      select: { date: true, status: true },
    });

    return {
      teacherId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      attendance: records.map((r) => ({ date: toISODate(r.date), status: r.status })),
    };
  }

  static async markTeacherAttendance(
    date: string,
    attendance: MarkTeacherAttendanceBody,
  ): Promise<TeacherAttendanceByDate> {
    const isoDate = fromISODate(date);

    await prisma.$transaction(async (tx) => {
      for (const item of attendance) {
        const teacher = await tx.teacher.findUnique({ where: { teacherId: item.teacherId } });
        if (!teacher) {
          throw new NotFoundError();
        }

        await tx.teacherAttendance.upsert({
          where: { teacherId_date: { teacherId: teacher.id, date: isoDate } },
          update: { status: item.status },
          create: { teacherId: teacher.id, date: isoDate, status: item.status },
        });
      }
    });

    return this.getTeacherAttendanceByDate(date);
  }

  static async updateTeacherAttendance(
    attendance: UpdateTeacherAttendanceBody,
  ): Promise<TeacherAttendanceRow[]> {
    await prisma.$transaction(async (tx) => {
      for (const item of attendance) {
        await tx.teacherAttendance.update({
          where: { id: item.id },
          data: { status: item.status },
        });
      }
    });

    const updated = await prisma.teacherAttendance.findMany({
      where: { id: { in: attendance.map((a) => a.id) } },
      select: {
        id: true,
        status: true,
        teacher: { select: { teacherId: true, firstName: true, lastName: true } },
      },
    });

    return updated.map((r) => ({
      id: r.id,
      teacherId: r.teacher.teacherId,
      firstName: r.teacher.firstName,
      lastName: r.teacher.lastName,
      status: r.status,
    }));
  }
}
