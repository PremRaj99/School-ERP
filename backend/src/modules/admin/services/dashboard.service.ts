import prisma from '@/core/db';
import { getTodayDate } from '../helpers';

export class AdminDashboardService {
  static async getDashboard() {
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
        select: { id: true, title: true, date: true, targetRole: true },
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
        date: today,
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
        dateFrom: exam.dateFrom,
        dateTo: exam.dateTo,
      })),
      recentNotices,
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
    };
  }
}
