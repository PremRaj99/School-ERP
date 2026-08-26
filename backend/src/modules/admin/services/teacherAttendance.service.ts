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

    // Pre-fetch all referenced teachers in a single query so the transaction
    // only has to run the upserts — halves the round-trips and avoids the
    // interactive-transaction timeout on serverless cold starts.
    const teacherIds = attendance.map((a) => a.teacherId);
    const teachers = await prisma.teacher.findMany({
      where: { teacherId: { in: teacherIds } },
      select: { id: true, teacherId: true },
    });

    const teacherMap = new Map(teachers.map((t) => [t.teacherId, t.id]));

    for (const item of attendance) {
      if (!teacherMap.has(item.teacherId)) {
        throw new NotFoundError(`Teacher ${item.teacherId} not found`);
      }
    }

    await prisma.$transaction(
      async (tx) => {
        for (const item of attendance) {
          const internalId = teacherMap.get(item.teacherId)!;

          await tx.teacherAttendance.upsert({
            where: { teacherId_date: { teacherId: internalId, date: isoDate } },
            update: { status: item.status },
            create: { teacherId: internalId, date: isoDate, status: item.status },
          });
        }
      },
      { timeout: 10000 },
    );

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
