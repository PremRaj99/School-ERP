import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { getCurrentMonthString, getCurrentSessionYear, getMonthStartEnd } from '../helpers';
import type {
  AdminAcademicsAnalytics,
  AdminAttendanceAnalytics,
  AdminFinanceAnalytics,
  AdminOverviewAnalytics,
  AdminStaffAnalytics,
  WeekDay,
} from '@schoolerp/contracts';
import { fromISODate, monthStartEndFromISO, toISODate, toISOMonth } from '@/shared/helpers/isoDate';

const WEEKDAY_BY_JS_DAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export class AdminAnalyticsService {
  static async getOverview(session?: string): Promise<AdminOverviewAnalytics> {
    const targetSession = session ?? getCurrentSessionYear();
    const { startDate: monthStart, endDate: monthEnd } = getMonthStartEnd(getCurrentMonthString());

    const [
      studentCount,
      teacherCount,
      classCount,
      subjectCount,
      classesInSession,
      sessionRows,
      feeAgg,
      attendanceGroups,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.class.findMany({
        where: { session: targetSession },
        select: { className: true, section: true, students: { select: { dateOfAdmission: true } } },
      }),
      prisma.class.findMany({ select: { session: true }, distinct: ['session'] }),
      prisma.transaction.groupBy({
        by: ['status'],
        where: { category: 'Fee', studentFee: { student: { class: { session: targetSession } } } },
        _sum: { finalAmount: true },
      }),
      prisma.studentAttendance.groupBy({
        by: ['status'],
        where: { date: { gte: monthStart, lt: monthEnd } },
        _count: { _all: true },
      }),
    ]);

    const enrollmentBySession = await Promise.all(
      sessionRows.map(async ({ session: sess }) => ({
        session: sess,
        count: await prisma.student.count({ where: { class: { session: sess } } }),
      })),
    );

    const studentsByClass = classesInSession.map((c) => ({
      className: c.className,
      section: c.section,
      count: c.students.length,
    }));

    const admissionsMap = new Map<string, number>();
    for (const c of classesInSession) {
      for (const s of c.students) {
        const month = toISOMonth(s.dateOfAdmission);
        admissionsMap.set(month, (admissionsMap.get(month) ?? 0) + 1);
      }
    }
    const admissionsByMonth = Array.from(admissionsMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));

    const paidSum = feeAgg.find((f) => f.status === 'Paid')?._sum.finalAmount ?? 0;
    const pendingSum = feeAgg.find((f) => f.status === 'Pending')?._sum.finalAmount ?? 0;
    const collectionRatePct =
      paidSum + pendingSum > 0 ? (paidSum / (paidSum + pendingSum)) * 100 : null;

    const present = attendanceGroups.find((a) => a.status === 'Present')?._count._all ?? 0;
    const totalMarked = attendanceGroups.reduce((sum, a) => sum + a._count._all, 0);
    const attendanceRatePct = totalMarked > 0 ? (present / totalMarked) * 100 : null;

    return {
      kpis: {
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalClasses: classCount,
        totalSubjects: subjectCount,
        collectionRatePct,
        attendanceRatePct,
      },
      enrollmentBySession,
      studentsByClass,
      admissionsByMonth,
    };
  }

  static async getAttendance(
    from: string,
    to: string,
    className?: string,
    section?: string,
  ): Promise<AdminAttendanceAnalytics> {
    const fromDate = fromISODate(from);
    const toDateExclusive = new Date(fromISODate(to).getTime() + 24 * 60 * 60 * 1000);
    const classFilter =
      className || section
        ? { class: { ...(className ? { className } : {}), ...(section ? { section } : {}) } }
        : {};

    const rows = await prisma.studentAttendance.findMany({
      where: { date: { gte: fromDate, lt: toDateExclusive }, student: classFilter },
      select: {
        date: true,
        status: true,
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            class: { select: { className: true, section: true } },
          },
        },
      },
    });

    const byDate = new Map<string, { present: number; total: number }>();
    const heatmap = new Map<
      string,
      { present: number; total: number; className: string; section: string; weekday: WeekDay }
    >();
    const byStudent = new Map<
      string,
      {
        present: number;
        total: number;
        studentId: string;
        firstName: string;
        lastName: string | null;
        className: string;
        section: string;
      }
    >();
    let present = 0;
    let absent = 0;
    let leave = 0;

    for (const r of rows) {
      const dateStr = toISODate(r.date);
      const dayEntry = byDate.get(dateStr) ?? { present: 0, total: 0 };
      dayEntry.total += 1;
      if (r.status === 'Present') dayEntry.present += 1;
      byDate.set(dateStr, dayEntry);

      if (r.status === 'Present') present += 1;
      else if (r.status === 'Absent') absent += 1;
      else leave += 1;

      const weekday = WEEKDAY_BY_JS_DAY[r.date.getUTCDay()];
      if (weekday !== 'SUN') {
        const key = `${r.student.class.className}-${r.student.class.section}-${weekday}`;
        const hEntry = heatmap.get(key) ?? {
          present: 0,
          total: 0,
          className: r.student.class.className,
          section: r.student.class.section,
          weekday: weekday as WeekDay,
        };
        hEntry.total += 1;
        if (r.status === 'Present') hEntry.present += 1;
        heatmap.set(key, hEntry);
      }

      const sEntry = byStudent.get(r.student.id) ?? {
        present: 0,
        total: 0,
        studentId: r.student.studentId,
        firstName: r.student.firstName,
        lastName: r.student.lastName,
        className: r.student.class.className,
        section: r.student.class.section,
      };
      sEntry.total += 1;
      if (r.status === 'Present') sEntry.present += 1;
      byStudent.set(r.student.id, sEntry);
    }

    const dailyAttendancePct = Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { present: p, total }]) => ({
        date,
        presentPct: total > 0 ? (p / total) * 100 : 0,
      }));

    const classHeatmap = Array.from(heatmap.values()).map((e) => ({
      className: e.className,
      section: e.section,
      weekday: e.weekday,
      presentPct: e.total > 0 ? (e.present / e.total) * 100 : 0,
    }));

    const chronicAbsentees = Array.from(byStudent.values())
      .map((e) => ({
        studentId: e.studentId,
        firstName: e.firstName,
        lastName: e.lastName,
        className: e.className,
        section: e.section,
        attendancePct: e.total > 0 ? (e.present / e.total) * 100 : 0,
      }))
      .filter((e) => e.attendancePct < 75)
      .sort((a, b) => a.attendancePct - b.attendancePct);

    return {
      dailyAttendancePct,
      classHeatmap,
      statusSplit: { present, absent, leave },
      chronicAbsentees,
    };
  }

  static async getAcademics(examId: string): Promise<AdminAcademicsAnalytics> {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examSubjects: {
          include: { subject: true, examResults: { include: { student: true } } },
        },
      },
    });
    if (!exam) {
      throw new NotFoundError();
    }

    const allResults = exam.examSubjects.flatMap((es) => es.examResults);

    const gradeMap = new Map<string, number>();
    for (const r of allResults) gradeMap.set(r.grade, (gradeMap.get(r.grade) ?? 0) + 1);
    const gradeDistribution = Array.from(gradeMap.entries()).map(([grade, count]) => ({
      grade,
      count,
    }));

    const subjectAverages = exam.examSubjects.map((es) => {
      const results = es.examResults;
      const averagePct =
        results.length > 0
          ? results.reduce((sum, r) => sum + (r.marksObtained / es.fullMarks) * 100, 0) /
            results.length
          : 0;
      return {
        subjectCode: es.subject.subjectCode,
        subjectName: es.subject.subjectName,
        averagePct,
      };
    });

    const passRatePct =
      allResults.length > 0
        ? (allResults.filter((r) => r.grade !== 'F').length / allResults.length) * 100
        : null;

    const byStudent = new Map<
      string,
      {
        studentId: string;
        firstName: string;
        lastName: string | null;
        totalObtained: number;
        totalMax: number;
      }
    >();
    for (const es of exam.examSubjects) {
      for (const r of es.examResults) {
        const entry = byStudent.get(r.studentId) ?? {
          studentId: r.student.studentId,
          firstName: r.student.firstName,
          lastName: r.student.lastName,
          totalObtained: 0,
          totalMax: 0,
        };
        entry.totalObtained += r.marksObtained;
        entry.totalMax += es.fullMarks;
        byStudent.set(r.studentId, entry);
      }
    }
    const ranked = Array.from(byStudent.values())
      .map((e) => ({
        studentId: e.studentId,
        firstName: e.firstName,
        lastName: e.lastName,
        totalPct: e.totalMax > 0 ? (e.totalObtained / e.totalMax) * 100 : 0,
      }))
      .sort((a, b) => b.totalPct - a.totalPct);
    const topPerformers = ranked.slice(0, 10);
    const bottomPerformers = ranked.length > 10 ? ranked.slice(-10).reverse() : [];

    const markingCompletionPct =
      exam.examSubjects.length > 0
        ? (exam.examSubjects.filter((es) => es.isMarked).length / exam.examSubjects.length) * 100
        : 0;

    return {
      examTitle: exam.title,
      gradeDistribution,
      subjectAverages,
      passRatePct,
      topPerformers,
      bottomPerformers,
      markingCompletionPct,
    };
  }

  static async getFinance(session?: string): Promise<AdminFinanceAnalytics> {
    const targetSession = session ?? getCurrentSessionYear();

    const [feeTxns, salaryTxns, categoryTotals, expenseTxns] = await Promise.all([
      prisma.transaction.findMany({
        where: { category: 'Fee', studentFee: { student: { class: { session: targetSession } } } },
        select: {
          finalAmount: true,
          status: true,
          createdAt: true,
          studentFee: {
            select: {
              month: true,
              student: {
                select: {
                  studentId: true,
                  firstName: true,
                  lastName: true,
                  class: { select: { className: true, section: true } },
                },
              },
            },
          },
        },
      }),
      prisma.transaction.findMany({
        where: { category: 'Salary' },
        select: { finalAmount: true, status: true, createdAt: true },
      }),
      prisma.transaction.groupBy({ by: ['category'], _sum: { finalAmount: true } }),
      // P4 — every manually-logged expense (books, whiteboards, ...), regardless of category,
      // is anything carrying an `expenseCategory` label. Not filtered to `category: 'Other'`
      // specifically since a user can also attach a label to a `Utility`/`Infrastructure` entry.
      prisma.transaction.findMany({
        where: { expenseCategory: { not: null } },
        select: { finalAmount: true, status: true, createdAt: true, expenseCategory: true },
      }),
    ]);

    const monthlyMap = new Map<string, { collected: number; pending: number }>();
    for (const t of feeTxns) {
      const month = toISOMonth(t.createdAt);
      const entry = monthlyMap.get(month) ?? { collected: 0, pending: 0 };
      if (t.status === 'Paid') entry.collected += t.finalAmount;
      else if (t.status === 'Pending') entry.pending += t.finalAmount;
      monthlyMap.set(month, entry);
    }
    const monthly = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }));

    const categorySplit = categoryTotals.map((c) => ({
      category: c.category,
      amount: c._sum.finalAmount ?? 0,
    }));

    let running = 0;
    const cumulativeCollection = monthly.map((m) => {
      running += m.collected;
      return { month: m.month, cumulative: running };
    });

    const defaulters = feeTxns
      .filter((t) => t.status === 'Pending' && t.studentFee)
      .map((t) => ({
        studentId: t.studentFee!.student.studentId,
        firstName: t.studentFee!.student.firstName,
        lastName: t.studentFee!.student.lastName,
        className: t.studentFee!.student.class.className,
        section: t.studentFee!.student.class.section,
        month: toISOMonth(t.studentFee!.month),
        amount: t.finalAmount,
      }));

    const salaryByMonth = new Map<string, number>();
    for (const t of salaryTxns) {
      if (t.status !== 'Paid') continue;
      const month = toISOMonth(t.createdAt);
      salaryByMonth.set(month, (salaryByMonth.get(month) ?? 0) + t.finalAmount);
    }
    const allMonths = new Set([...monthlyMap.keys(), ...salaryByMonth.keys()]);
    const salaryVsCollection = Array.from(allMonths)
      .sort()
      .map((month) => ({
        month,
        salaryBurn: salaryByMonth.get(month) ?? 0,
        feeCollection: monthlyMap.get(month)?.collected ?? 0,
      }));

    const expenseByLabel = new Map<string, number>();
    const expenseByMonth = new Map<string, number>();
    let totalExpenses = 0;
    for (const t of expenseTxns) {
      if (t.status === 'Failed') continue;
      const label = t.expenseCategory ?? 'Other';
      expenseByLabel.set(label, (expenseByLabel.get(label) ?? 0) + t.finalAmount);
      const month = toISOMonth(t.createdAt);
      expenseByMonth.set(month, (expenseByMonth.get(month) ?? 0) + t.finalAmount);
      totalExpenses += t.finalAmount;
    }
    const expenseBreakdown = Array.from(expenseByLabel.entries())
      .map(([label, amount]) => ({ label, amount }))
      .sort((a, b) => b.amount - a.amount);
    const monthlyExpenses = Array.from(expenseByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));

    return {
      monthly,
      categorySplit,
      cumulativeCollection,
      defaulters,
      salaryVsCollection,
      expenseBreakdown,
      monthlyExpenses,
      totalExpenses,
    };
  }

  static async getStaff(month: string): Promise<AdminStaffAnalytics> {
    const { startDate, endDate } = monthStartEndFromISO(month);

    const [
      teachers,
      attendanceRows,
      timetableCounts,
      examSubjects,
      allSubjects,
      coveredSubjectIds,
    ] = await Promise.all([
      prisma.teacher.findMany({
        select: { id: true, teacherId: true, firstName: true, lastName: true },
      }),
      prisma.teacherAttendance.findMany({
        where: { date: { gte: startDate, lt: endDate } },
        select: { teacherId: true, status: true },
      }),
      prisma.timeTable.groupBy({ by: ['teacherId'], _count: { _all: true } }),
      prisma.examSubject.findMany({ select: { teacherId: true, isMarked: true } }),
      prisma.subject.findMany({ select: { id: true, subjectCode: true, subjectName: true } }),
      prisma.timeTable.findMany({ select: { subjectId: true }, distinct: ['subjectId'] }),
    ]);

    const attendanceByTeacher = new Map<string, { present: number; total: number }>();
    for (const r of attendanceRows) {
      const entry = attendanceByTeacher.get(r.teacherId) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (r.status === 'Present') entry.present += 1;
      attendanceByTeacher.set(r.teacherId, entry);
    }
    const attendanceLeaderboard = teachers
      .map((t) => {
        const a = attendanceByTeacher.get(t.id);
        return {
          teacherId: t.teacherId,
          firstName: t.firstName,
          lastName: t.lastName,
          attendancePct: a && a.total > 0 ? (a.present / a.total) * 100 : 0,
        };
      })
      .sort((a, b) => b.attendancePct - a.attendancePct);

    const workloadMap = new Map(timetableCounts.map((w) => [w.teacherId, w._count._all]));
    const workload = teachers
      .map((t) => ({
        teacherId: t.teacherId,
        firstName: t.firstName,
        lastName: t.lastName,
        periodsPerWeek: workloadMap.get(t.id) ?? 0,
      }))
      .sort((a, b) => b.periodsPerWeek - a.periodsPerWeek);

    const markingByTeacher = new Map<string, { marked: number; total: number }>();
    for (const es of examSubjects) {
      const entry = markingByTeacher.get(es.teacherId) ?? { marked: 0, total: 0 };
      entry.total += 1;
      if (es.isMarked) entry.marked += 1;
      markingByTeacher.set(es.teacherId, entry);
    }
    const markingCompletion = teachers
      .map((t) => {
        const m = markingByTeacher.get(t.id);
        return {
          teacherId: t.teacherId,
          firstName: t.firstName,
          lastName: t.lastName,
          completionPct: m && m.total > 0 ? (m.marked / m.total) * 100 : 0,
        };
      })
      .sort((a, b) => a.completionPct - b.completionPct);

    const coveredIds = new Set(coveredSubjectIds.map((c) => c.subjectId));
    const subjectCoverageGaps = allSubjects
      .filter((s) => !coveredIds.has(s.id))
      .map((s) => ({ subjectCode: s.subjectCode, subjectName: s.subjectName }));

    return { attendanceLeaderboard, workload, markingCompletion, subjectCoverageGaps };
  }
}
