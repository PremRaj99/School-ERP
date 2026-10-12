import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import type { ReportCardResult, ReportCardSet, ReportCardStudent } from '@schoolerp/contracts';
import { ACTIVE_STUDENT_STATUS_FILTER } from './activeStudentFilter';
import { getGrade } from './getGrade';
import { getHolidays } from './holidays';
import { fromISODate, toISODate } from './isoDate';

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Builds the report cards for one exam: marks per subject, totals, overall grade, pass/fail, rank in
 * class, and attendance from the session start up to the exam's last day.
 *
 * Students = the class's active roster plus anyone who has a mark in this exam (so a student promoted
 * out of the class since still gets their card). `onlyStudentDbId` narrows the returned list to one
 * student — the rank is still computed against the whole class.
 */
export async function buildReportCards(
  examId: string,
  onlyStudentDbId?: string,
): Promise<ReportCardSet> {
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    select: {
      id: true,
      title: true,
      dateFrom: true,
      dateTo: true,
      isResultDecleared: true,
      classId: true,
      class: { select: { className: true, section: true, session: true } },
      examSubjects: {
        select: {
          id: true,
          fullMarks: true,
          date: true,
          startTime: true,
          subject: { select: { subjectCode: true, subjectName: true } },
        },
      },
    },
  });
  if (!exam) {
    throw new NotFoundError('Exam not found.');
  }

  const papers = [...exam.examSubjects].sort(
    (a, b) =>
      a.date.getTime() - b.date.getTime() ||
      (a.startTime ?? '99').localeCompare(b.startTime ?? '99'),
  );

  const results = await prisma.examResult.findMany({
    where: { examSubject: { examId } },
    select: {
      studentId: true,
      examSubjectId: true,
      marksObtained: true,
      grade: true,
      remark: true,
    },
  });
  const resultKey = (studentDbId: string, examSubjectId: string) =>
    `${studentDbId}:${examSubjectId}`;
  const resultByKey = new Map(results.map((r) => [resultKey(r.studentId, r.examSubjectId), r]));

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { classId: exam.classId, ...ACTIVE_STUDENT_STATUS_FILTER },
        { id: { in: [...new Set(results.map((r) => r.studentId))] } },
      ],
    },
    orderBy: { rollNo: 'asc' },
    select: {
      id: true,
      studentId: true,
      rollNo: true,
      firstName: true,
      lastName: true,
      fatherName: true,
      motherName: true,
      dob: true,
    },
  });

  // Attendance window: 1 April of the session's first year → the exam's last day, never past today.
  const attendanceFrom = `${exam.class.session.slice(0, 4)}-04-01`;
  const examEnd = toISODate(exam.dateTo ?? exam.dateFrom);
  const today = toISODate(new Date());
  const attendanceTo = examEnd < today ? examEnd : today;
  const windowEnd = fromISODate(attendanceTo);
  windowEnd.setUTCHours(23, 59, 59, 999);
  const window = { gte: fromISODate(attendanceFrom), lte: windowEnd };

  const [holidays, markedDays, attendanceRows] =
    attendanceTo >= attendanceFrom
      ? await Promise.all([
          getHolidays(attendanceFrom, attendanceTo),
          prisma.classAttendance.findMany({
            where: { classId: exam.classId, isMarked: true, date: window },
            select: { date: true },
          }),
          prisma.studentAttendance.findMany({
            where: { studentId: { in: students.map((s) => s.id) }, date: window },
            select: { studentId: true, date: true, status: true },
          }),
        ])
      : [new Map<string, string>(), [], []];

  const workingDays = new Set(
    markedDays.map((d) => toISODate(d.date)).filter((d) => !holidays.has(d)),
  ).size;
  const attendanceByStudent = new Map<string, { present: number; absent: number; leave: number }>();
  for (const row of attendanceRows) {
    if (holidays.has(toISODate(row.date))) continue;
    const counts = attendanceByStudent.get(row.studentId) ?? { present: 0, absent: 0, leave: 0 };
    if (row.status === 'Present') counts.present += 1;
    else if (row.status === 'Absent') counts.absent += 1;
    else counts.leave += 1;
    attendanceByStudent.set(row.studentId, counts);
  }

  const totalFull = papers.reduce((sum, p) => sum + p.fullMarks, 0);

  const cards = students.map(
    (student): { dbId: string; hasMarks: boolean; card: ReportCardStudent } => {
      const marks = papers.map((paper) => {
        const result = resultByKey.get(resultKey(student.id, paper.id));
        return {
          subjectCode: paper.subject.subjectCode,
          marksObtained: result?.marksObtained ?? null,
          grade: result?.grade ?? null,
          remark: result?.remark ?? null,
        };
      });
      const markedCount = marks.filter((m) => m.marksObtained !== null).length;
      const totalObtained = marks.reduce((sum, m) => sum + (m.marksObtained ?? 0), 0);
      const percentage = totalFull > 0 ? round1((totalObtained / totalFull) * 100) : 0;
      const result: ReportCardResult = marks.some((m) => m.grade === 'F')
        ? 'Fail'
        : markedCount < papers.length || papers.length === 0
          ? 'Incomplete'
          : 'Pass';
      const attendance = attendanceByStudent.get(student.id) ?? { present: 0, absent: 0, leave: 0 };

      return {
        dbId: student.id,
        hasMarks: markedCount > 0,
        card: {
          studentId: student.studentId,
          rollNo: student.rollNo,
          firstName: student.firstName,
          lastName: student.lastName,
          fatherName: student.fatherName,
          motherName: student.motherName,
          dob: student.dob ? toISODate(student.dob) : null,
          marks,
          totalObtained,
          totalFull,
          percentage,
          grade: totalFull > 0 ? getGrade(totalFull, totalObtained) : '—',
          result,
          rank: null,
          attendance: {
            workingDays,
            ...attendance,
            percent: workingDays > 0 ? round1((attendance.present / workingDays) * 100) : 0,
          },
        },
      };
    },
  );

  // Competition ranking (1, 2, 2, 4) by percentage, among students with at least one mark.
  const ranked = cards
    .filter((c) => c.hasMarks)
    .sort((a, b) => b.card.percentage - a.card.percentage);
  ranked.forEach((entry, i) => {
    const prev = ranked[i - 1];
    entry.card.rank =
      prev && prev.card.percentage === entry.card.percentage ? prev.card.rank : i + 1;
  });

  return {
    exam: {
      id: exam.id,
      title: exam.title,
      dateFrom: toISODate(exam.dateFrom),
      dateTo: exam.dateTo ? toISODate(exam.dateTo) : null,
      isResultDecleared: exam.isResultDecleared,
      className: exam.class.className,
      section: exam.class.section,
      session: exam.class.session,
    },
    subjects: papers.map((p) => ({
      subjectCode: p.subject.subjectCode,
      subjectName: p.subject.subjectName,
      fullMarks: p.fullMarks,
      date: toISODate(p.date),
    })),
    attendanceFrom,
    attendanceTo,
    classStrength: ranked.length,
    students: cards
      .filter((c) => !onlyStudentDbId || c.dbId === onlyStudentDbId)
      .map((c) => c.card),
  };
}
