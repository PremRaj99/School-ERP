import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import type {
  AdminStudentAttendanceQuery,
  AdminStudentAttendanceReport,
} from '@schoolerp/contracts';
import { fromISODate } from '@/shared/helpers/isoDate';
import { ACTIVE_STUDENT_STATUS_FILTER } from '../helpers';

export class AdminStudentAttendanceService {
  static async getReport(
    query: AdminStudentAttendanceQuery,
  ): Promise<AdminStudentAttendanceReport> {
    const classRecord = await prisma.class.findUnique({ where: { id: query.classId } });
    if (!classRecord) {
      throw new NotFoundError('Class not found.');
    }

    const from = fromISODate(query.from);
    const to = fromISODate(query.to);
    // `to` parses to midnight — widen it to the end of that calendar day so the range is
    // inclusive on both ends, matching what an admin picking "from X to Y" expects.
    const toEnd = new Date(to);
    toEnd.setUTCHours(23, 59, 59, 999);

    const students = await prisma.student.findMany({
      where: { classId: classRecord.id, ...ACTIVE_STUDENT_STATUS_FILTER },
      orderBy: { rollNo: 'asc' },
      select: { id: true, studentId: true, rollNo: true, firstName: true, lastName: true },
    });

    const [totalMarkedDays, attendanceRows] = await Promise.all([
      prisma.classAttendance.count({
        where: { classId: classRecord.id, isMarked: true, date: { gte: from, lte: toEnd } },
      }),
      prisma.studentAttendance.findMany({
        where: { studentId: { in: students.map((s) => s.id) }, date: { gte: from, lte: toEnd } },
        select: { studentId: true, status: true },
      }),
    ]);

    const statsByStudent = new Map<string, { present: number; absent: number; leave: number }>();
    for (const row of attendanceRows) {
      const stats = statsByStudent.get(row.studentId) ?? { present: 0, absent: 0, leave: 0 };
      if (row.status === 'Present') stats.present += 1;
      else if (row.status === 'Absent') stats.absent += 1;
      else stats.leave += 1;
      statsByStudent.set(row.studentId, stats);
    }

    return {
      classId: classRecord.id,
      className: classRecord.className,
      section: classRecord.section,
      from: query.from,
      to: query.to,
      totalMarkedDays,
      students: students.map((student) => {
        const stats = statsByStudent.get(student.id) ?? { present: 0, absent: 0, leave: 0 };
        const attendancePercent =
          totalMarkedDays > 0 ? Math.round((stats.present / totalMarkedDays) * 1000) / 10 : 0;
        return {
          studentId: student.studentId,
          rollNo: student.rollNo,
          firstName: student.firstName,
          lastName: student.lastName,
          presentCount: stats.present,
          absentCount: stats.absent,
          leaveCount: stats.leave,
          attendancePercent,
        };
      }),
    };
  }
}
