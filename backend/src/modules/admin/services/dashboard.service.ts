import prisma from '@/core/db';
import { getTodayDate } from '../helpers';
import type { AdminDashboard, ClassFeeSummary } from '@schoolerp/contracts';
import {
  fromISOMonth,
  monthStartEndFromISO,
  toISODate,
  toISOMonth,
} from '@/shared/helpers/isoDate';
import { NOTICE_SUMMARY_SELECT, toNoticeSummaries } from '@/shared/helpers/notice';
import { ACTIVE_STUDENT_STATUS_FILTER } from '@/shared/helpers/activeStudentFilter';
import { getClassFees, getFeeSettings } from '@/shared/helpers/feeSettings';
import { AdminStudentFeeService } from './studentFee.service';

export class AdminDashboardService {
  static async getDashboard(): Promise<AdminDashboard> {
    const today = getTodayDate();

    const [
      studentCount,
      teacherCount,
      classCount,
      subjectCount,
      todayTeacherAttendance,
      upcomingExams,
      recentNotices,
      pendingFees,
      pendingSalaries,
      classWiseFees,
      sessionFeeDues,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.teacherAttendance.groupBy({
        by: ['status'],
        where: { date: today },
        _count: { _all: true },
      }),
      prisma.exam.findMany({
        where: { dateFrom: { gte: today } },
        orderBy: { dateFrom: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          dateFrom: true,
          dateTo: true,
          class: { select: { className: true, section: true } },
        },
      }),
      prisma.notice.findMany({
        orderBy: { date: 'desc' },
        take: 5,
        select: NOTICE_SUMMARY_SELECT,
      }),
      prisma.transaction.aggregate({
        where: { category: 'Fee', status: 'Pending' },
        _count: { _all: true },
        _sum: { finalAmount: true },
      }),
      prisma.transaction.aggregate({
        where: { category: 'Salary', status: 'Pending' },
        _count: { _all: true },
        _sum: { finalAmount: true },
      }),
      AdminDashboardService.getClassWiseFees(toISOMonth(today)),
      AdminStudentFeeService.getSessionDues(),
    ]);

    const present = todayTeacherAttendance.find((a) => a.status === 'Present')?._count._all ?? 0;
    const absent = todayTeacherAttendance.find((a) => a.status === 'Absent')?._count._all ?? 0;
    const leave = todayTeacherAttendance.find((a) => a.status === 'Leave')?._count._all ?? 0;

    return {
      counts: {
        students: studentCount,
        teachers: teacherCount,
        classes: classCount,
        subjects: subjectCount,
      },
      todayTeacherAttendance: {
        date: toISODate(today),
        present,
        absent,
        leave,
        unmarked: Math.max(teacherCount - present - absent - leave, 0),
        total: teacherCount,
      },
      upcomingExams: upcomingExams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        className: exam.class.className,
        section: exam.class.section,
        dateFrom: toISODate(exam.dateFrom),
        dateTo: exam.dateTo ? toISODate(exam.dateTo) : null,
      })),
      recentNotices: await toNoticeSummaries(recentNotices),
      finance: {
        pendingStudentFees: {
          count: pendingFees._count._all,
          totalAmount: pendingFees._sum.finalAmount ?? 0,
        },
        pendingTeacherSalaries: {
          count: pendingSalaries._count._all,
          totalAmount: pendingSalaries._sum.finalAmount ?? 0,
        },
      },
      sessionFeeDues,
      classWiseFees,
    };
  }

  /**
   * Fees for `isoMonth`, per active class. A student counts toward their current class: the same
   * roster as the monthly-status view (active, admitted by month end), and a fee with no
   * record yet is expected at the class's monthly fee (its own, else the school default).
   */
  static async getClassWiseFees(isoMonth: string): Promise<AdminDashboard['classWiseFees']> {
    const { endDate } = monthStartEndFromISO(isoMonth);
    const [classes, students, fees, settings] = await Promise.all([
      getClassFees(),
      prisma.student.findMany({
        where: { ...ACTIVE_STUDENT_STATUS_FILTER, dateOfAdmission: { lt: endDate } },
        select: { id: true, classId: true },
      }),
      prisma.studentFee.findMany({
        where: { month: fromISOMonth(isoMonth) },
        select: {
          studentId: true,
          transaction: { select: { status: true, finalAmount: true } },
        },
      }),
      getFeeSettings(),
    ]);

    const feeByStudent = new Map(fees.map((f) => [f.studentId, f.transaction]));
    const byClass = new Map<string, ClassFeeSummary>(
      classes.map((c) => [
        c.classId,
        {
          classId: c.classId,
          className: c.className,
          section: c.section,
          monthlyFee: c.effectiveFee,
          students: 0,
          paidCount: 0,
          pendingCount: 0,
          notGeneratedCount: 0,
          collected: 0,
          pending: 0,
          expected: 0,
        },
      ]),
    );

    for (const student of students) {
      const row = byClass.get(student.classId);
      if (!row) continue; // student sits in an archived class
      row.students += 1;
      const txn = feeByStudent.get(student.id);
      if (!txn) {
        row.notGeneratedCount += 1;
        row.expected += row.monthlyFee;
      } else if (txn.status === 'Paid') {
        row.paidCount += 1;
        row.collected += txn.finalAmount;
        row.expected += txn.finalAmount;
      } else {
        row.pendingCount += 1;
        row.pending += txn.finalAmount;
        row.expected += txn.finalAmount;
      }
    }

    return {
      month: isoMonth,
      defaultMonthlyFee: settings.defaultMonthlyFee,
      // `getClassFees` already returns classes in order.
      classes: Array.from(byClass.values()).filter((c) => c.students > 0),
    };
  }
}
