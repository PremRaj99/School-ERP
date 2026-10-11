import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import type {
  AdminClassesAttendanceQuery,
  AdminClassesAttendanceSummary,
  AdminStudentAttendanceQuery,
  AdminStudentAttendanceReport,
  AttendanceStatus,
  StudentDailyAttendance,
} from '@schoolerp/contracts';
import { fromISODate, toISODate } from '@/shared/helpers/isoDate';
import { ACTIVE_STUDENT_STATUS_FILTER } from '../helpers';

interface StatusCounts {
  present: number;
  absent: number;
  leave: number;
}

const emptyCounts = (): StatusCounts => ({ present: 0, absent: 0, leave: 0 });

const tally = (counts: StatusCounts, status: AttendanceStatus) => {
  if (status === 'Present') counts.present += 1;
  else if (status === 'Absent') counts.absent += 1;
  else counts.leave += 1;
};

const percent = (part: number, whole: number) =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

/**
 * `from`/`to` as a Prisma date range. `to` parses to midnight — widen it to the end of that
 * calendar day so the range is inclusive on both ends, matching what an admin picking
 * "from X to Y" expects.
 */
const dateRange = (fromIso: string, toIso: string) => {
  const toEnd = fromISODate(toIso);
  toEnd.setUTCHours(23, 59, 59, 999);
  return { gte: fromISODate(fromIso), lte: toEnd };
};

export class AdminStudentAttendanceService {
  static async getReport(
    query: AdminStudentAttendanceQuery,
  ): Promise<AdminStudentAttendanceReport> {
    const classRecord = await prisma.class.findUnique({ where: { id: query.classId } });
    if (!classRecord) {
      throw new NotFoundError('Class not found.');
    }

    const date = dateRange(query.from, query.to);

    const students = await prisma.student.findMany({
      where: { classId: classRecord.id, ...ACTIVE_STUDENT_STATUS_FILTER },
      orderBy: { rollNo: 'asc' },
      select: { id: true, studentId: true, rollNo: true, firstName: true, lastName: true },
    });

    const [markedDays, attendanceRows] = await Promise.all([
      prisma.classAttendance.findMany({
        where: { classId: classRecord.id, isMarked: true, date },
        orderBy: { date: 'asc' },
        select: { date: true },
      }),
      prisma.studentAttendance.findMany({
        where: { studentId: { in: students.map((s) => s.id) }, date },
        orderBy: { date: 'asc' },
        select: { studentId: true, status: true, date: true },
      }),
    ]);

    const markedDates = Array.from(new Set(markedDays.map((d) => toISODate(d.date))));
    const totalMarkedDays = markedDates.length;

    const byStudent = new Map<string, { counts: StatusCounts; daily: StudentDailyAttendance[] }>();
    for (const row of attendanceRows) {
      const entry = byStudent.get(row.studentId) ?? { counts: emptyCounts(), daily: [] };
      tally(entry.counts, row.status);
      entry.daily.push({ date: toISODate(row.date), status: row.status });
      byStudent.set(row.studentId, entry);
    }

    return {
      classId: classRecord.id,
      className: classRecord.className,
      section: classRecord.section,
      from: query.from,
      to: query.to,
      totalMarkedDays,
      markedDates,
      students: students.map((student) => {
        const entry = byStudent.get(student.id) ?? { counts: emptyCounts(), daily: [] };
        return {
          studentId: student.studentId,
          rollNo: student.rollNo,
          firstName: student.firstName,
          lastName: student.lastName,
          presentCount: entry.counts.present,
          absentCount: entry.counts.absent,
          leaveCount: entry.counts.leave,
          attendancePercent: percent(entry.counts.present, totalMarkedDays),
          daily: entry.daily,
        };
      }),
    };
  }

  /** One aggregate row per class in `session` — three queries total, regardless of class count. */
  static async getClassesSummary(
    query: AdminClassesAttendanceQuery,
  ): Promise<AdminClassesAttendanceSummary> {
    const date = dateRange(query.from, query.to);

    const classes = await prisma.class.findMany({
      where: { session: query.session },
      select: { id: true, className: true, section: true },
    });
    const classIds = classes.map((c) => c.id);

    const [students, markedDays] = await Promise.all([
      prisma.student.findMany({
        where: { classId: { in: classIds }, ...ACTIVE_STUDENT_STATUS_FILTER },
        select: { id: true, classId: true },
      }),
      prisma.classAttendance.findMany({
        where: { classId: { in: classIds }, isMarked: true, date },
        select: { classId: true, date: true },
      }),
    ]);

    const attendanceRows = await prisma.studentAttendance.findMany({
      where: { studentId: { in: students.map((s) => s.id) }, date },
      select: { studentId: true, status: true },
    });

    const classOfStudent = new Map(students.map((s) => [s.id, s.classId]));
    const studentCount = new Map<string, number>();
    for (const s of students) studentCount.set(s.classId, (studentCount.get(s.classId) ?? 0) + 1);

    const markedDates = new Map<string, Set<string>>();
    for (const d of markedDays) {
      const set = markedDates.get(d.classId) ?? new Set<string>();
      set.add(toISODate(d.date));
      markedDates.set(d.classId, set);
    }

    const countsByClass = new Map<string, StatusCounts>();
    for (const row of attendanceRows) {
      const classId = classOfStudent.get(row.studentId);
      if (!classId) continue;
      const counts = countsByClass.get(classId) ?? emptyCounts();
      tally(counts, row.status);
      countsByClass.set(classId, counts);
    }

    const rows = classes.map((c) => {
      const count = studentCount.get(c.id) ?? 0;
      const totalMarkedDays = markedDates.get(c.id)?.size ?? 0;
      const counts = countsByClass.get(c.id) ?? emptyCounts();
      return {
        classId: c.id,
        className: c.className,
        section: c.section,
        studentCount: count,
        totalMarkedDays,
        presentCount: counts.present,
        absentCount: counts.absent,
        leaveCount: counts.leave,
        attendancePercent: percent(counts.present, count * totalMarkedDays),
      };
    });

    rows.sort(
      (a, b) =>
        a.className.localeCompare(b.className, undefined, { numeric: true }) ||
        a.section.localeCompare(b.section),
    );

    return { session: query.session, from: query.from, to: query.to, classes: rows };
  }
}
