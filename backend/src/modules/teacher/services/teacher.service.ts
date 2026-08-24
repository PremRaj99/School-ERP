import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import {
  getCurrentMonthString,
  getMonthStartEnd,
  getTodayDate,
  timeTableFormattedData,
} from '../helpers';
import { getCurrentSessionYear } from '@/shared';
import type { TeacherAnalytics, TeacherDashboard, TeacherRecord } from '@schoolerp/contracts';
import { toISODate, toISOMonth } from '@/shared/helpers/isoDate';

const WEEKDAY_BY_JS_DAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export class TeacherService {
  static async getTeacherProfile(userId: string): Promise<TeacherRecord> {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: {
        teacherId: true,
        firstName: true,
        lastName: true,
        dob: true,
        gender: true,
        address: true,
        phone: true,
        teacherAadhar: true,
        dateOfJoining: true,
        about: true,
        salaryPerMonth: true,
        qualifications: true,
        subjectHandled: true,
        profilePhoto: true,
        user: { select: { username: true } },
      },
    });

    if (!teacher) {
      throw new NotFoundError();
    }

    return {
      teacherId: teacher.teacherId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      dob: toISODate(teacher.dob),
      gender: teacher.gender ?? null,
      address: teacher.address,
      phone: teacher.phone,
      teacherAadhar: teacher.teacherAadhar,
      dateOfJoining: toISODate(teacher.dateOfJoining),
      about: teacher.about,
      salaryPerMonth: teacher.salaryPerMonth,
      qualifications: teacher.qualifications,
      subjectHandled: teacher.subjectHandled,
      profilePhoto: teacher.profilePhoto,
      username: teacher.user?.username ?? '',
    };
  }

  static async getTimetables(userId: string) {
    const timeTable = await prisma.timeTable.findMany({
      where: { teacher: { userId } },
      select: {
        class: { select: { className: true, section: true } },
        teacher: { select: { teacherId: true, firstName: true, lastName: true } },
        weekday: true,
        subject: { select: { subjectName: true, subjectCode: true } },
        period: true,
      },
    });

    return timeTableFormattedData(timeTable);
  }

  static async getNotices() {
    const notices = await prisma.notice.findMany({
      where: { targetRole: { in: ['Teacher', 'All'] } },
      select: { id: true, title: true, date: true, targetRole: true, expiryDate: true },
    });
    return notices.map((n) => ({
      id: n.id,
      title: n.title,
      date: toISODate(n.date),
      targetRole: n.targetRole,
      expiryDate: n.expiryDate ? toISODate(n.expiryDate) : null,
    }));
  }

  static async getNoticeDetail(noticeId: string) {
    const notice = await prisma.notice.findFirst({
      where: { id: noticeId, targetRole: { in: ['Teacher', 'All'] } },
    });

    if (!notice) {
      throw new NotFoundError();
    }
    return {
      id: notice.id,
      title: notice.title,
      description: notice.description,
      fileUrl: notice.fileUrl,
      targetRole: notice.targetRole,
      date: toISODate(notice.date),
      expiryDate: notice.expiryDate ? toISODate(notice.expiryDate) : null,
    };
  }

  static async getAcademicCalendar() {
    const events = await prisma.academicCalendar.findMany();
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      date: toISODate(e.date),
      category: e.category,
    }));
  }

  static async getDashboard(userId: string): Promise<TeacherDashboard> {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: {
        id: true,
        teacherId: true,
        firstName: true,
        lastName: true,
        subjectHandled: true,
        profilePhoto: true,
      },
    });

    if (!teacher) {
      throw new NotFoundError();
    }

    const today = getTodayDate();
    const { startDate, endDate } = getMonthStartEnd(getCurrentMonthString());
    const todayWeekday = WEEKDAY_BY_JS_DAY[today.getUTCDay()];

    const [attendanceGroups, todaySchedule, pendingResultEntries, recentNotices, pendingSalary] =
      await Promise.all([
        prisma.teacherAttendance.groupBy({
          by: ['status'],
          where: { teacherId: teacher.id, date: { gte: startDate, lt: endDate } },
          _count: { _all: true },
        }),
        todayWeekday === 'SUN'
          ? Promise.resolve([])
          : prisma.timeTable.findMany({
              where: { teacherId: teacher.id, weekday: todayWeekday },
              orderBy: { period: 'asc' },
              select: {
                period: true,
                class: { select: { className: true, section: true } },
                subject: { select: { subjectCode: true, subjectName: true } },
              },
            }),
        prisma.examSubject.findMany({
          where: { teacherId: teacher.id, isMarked: false },
          orderBy: { date: 'asc' },
          take: 5,
          select: {
            id: true,
            date: true,
            exam: {
              select: {
                id: true,
                title: true,
                class: { select: { className: true, section: true } },
              },
            },
            subject: { select: { subjectCode: true, subjectName: true } },
          },
        }),
        prisma.notice.findMany({
          where: { targetRole: { in: ['Teacher', 'All'] } },
          orderBy: { date: 'desc' },
          take: 5,
          select: { id: true, title: true, date: true, targetRole: true, expiryDate: true },
        }),
        prisma.transaction.aggregate({
          where: { status: 'Pending', teacherSalary: { teacherId: teacher.id } },
          _count: { _all: true },
          _sum: { finalAmount: true },
        }),
      ]);

    const present = attendanceGroups.find((a) => a.status === 'Present')?._count._all ?? 0;
    const absent = attendanceGroups.find((a) => a.status === 'Absent')?._count._all ?? 0;
    const leave = attendanceGroups.find((a) => a.status === 'Leave')?._count._all ?? 0;

    return {
      profile: {
        teacherId: teacher.teacherId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        subjectHandled: teacher.subjectHandled,
        profilePhoto: teacher.profilePhoto,
      },
      attendanceThisMonth: { present, absent, leave, total: present + absent + leave },
      todaySchedule: todaySchedule.map((entry) => ({
        periodNumber: entry.period,
        className: entry.class.className,
        section: entry.class.section,
        subjectCode: entry.subject.subjectCode,
        subjectName: entry.subject.subjectName,
      })),
      pendingResultEntries: pendingResultEntries.map((entry) => ({
        examSubjectId: entry.id,
        examId: entry.exam.id,
        examTitle: entry.exam.title,
        className: entry.exam.class.className,
        section: entry.exam.class.section,
        subjectCode: entry.subject.subjectCode,
        subjectName: entry.subject.subjectName,
        date: toISODate(entry.date),
      })),
      recentNotices: recentNotices.map((n) => ({
        id: n.id,
        title: n.title,
        date: toISODate(n.date),
        targetRole: n.targetRole,
        expiryDate: n.expiryDate ? toISODate(n.expiryDate) : null,
      })),
      pendingSalary: {
        count: pendingSalary._count._all,
        totalAmount: pendingSalary._sum.finalAmount ?? 0,
      },
    };
  }

  static async getAnalytics(userId: string, session?: string): Promise<TeacherAnalytics> {
    const teacher = await prisma.teacher.findUnique({ where: { userId }, select: { id: true } });
    if (!teacher) {
      throw new NotFoundError();
    }

    const targetSession = session ?? getCurrentSessionYear();

    const [ownAttendanceRows, taughtClasses, examSubjects] = await Promise.all([
      prisma.teacherAttendance.findMany({
        where: { teacherId: teacher.id },
        select: { date: true, status: true },
      }),
      prisma.timeTable.findMany({
        where: { teacherId: teacher.id, class: { session: targetSession } },
        select: { classId: true, class: { select: { className: true, section: true } } },
        distinct: ['classId'],
      }),
      prisma.examSubject.findMany({
        where: { teacherId: teacher.id },
        include: { subject: true, exam: true, examResults: true },
        orderBy: { date: 'asc' },
      }),
    ]);

    const ownMap = new Map<string, { present: number; total: number }>();
    for (const r of ownAttendanceRows) {
      const month = toISOMonth(r.date);
      const entry = ownMap.get(month) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (r.status === 'Present') entry.present += 1;
      ownMap.set(month, entry);
    }
    const ownAttendanceTrend = Array.from(ownMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, { present, total }]) => ({
        month,
        presentPct: total > 0 ? (present / total) * 100 : 0,
      }));

    const classAttendanceRows = await Promise.all(
      taughtClasses.map((tc) =>
        prisma.studentAttendance.findMany({
          where: { student: { classId: tc.classId } },
          select: { date: true, status: true },
        }),
      ),
    );
    const classAttendanceTrend: TeacherAnalytics['classAttendanceTrend'] = [];
    taughtClasses.forEach((tc, idx) => {
      const map = new Map<string, { present: number; total: number }>();
      for (const r of classAttendanceRows[idx]!) {
        const month = toISOMonth(r.date);
        const entry = map.get(month) ?? { present: 0, total: 0 };
        entry.total += 1;
        if (r.status === 'Present') entry.present += 1;
        map.set(month, entry);
      }
      for (const [month, { present, total }] of map.entries()) {
        classAttendanceTrend.push({
          className: tc.class.className,
          section: tc.class.section,
          month,
          presentPct: total > 0 ? (present / total) * 100 : 0,
        });
      }
    });
    classAttendanceTrend.sort((a, b) => a.month.localeCompare(b.month));

    const subjectAverages = examSubjects
      .filter((es) => es.isMarked && es.examResults.length > 0)
      .map((es) => {
        const averagePct =
          es.examResults.reduce((sum, r) => sum + (r.marksObtained / es.fullMarks) * 100, 0) /
          es.examResults.length;
        return {
          subjectCode: es.subject.subjectCode,
          subjectName: es.subject.subjectName,
          examTitle: es.exam.title,
          date: toISODate(es.date),
          averagePct,
        };
      });

    const markedSubjects = examSubjects
      .filter((es) => es.isMarked)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    let lastExamGradeDistribution: TeacherAnalytics['lastExamGradeDistribution'] = null;
    if (markedSubjects.length > 0) {
      const gradeMap = new Map<string, number>();
      for (const r of markedSubjects[0]!.examResults) {
        gradeMap.set(r.grade, (gradeMap.get(r.grade) ?? 0) + 1);
      }
      lastExamGradeDistribution = Array.from(gradeMap.entries()).map(([grade, count]) => ({
        grade,
        count,
      }));
    }

    return {
      ownAttendanceTrend,
      classAttendanceTrend,
      subjectAverages,
      lastExamGradeDistribution,
      markingBacklog: {
        marked: examSubjects.filter((es) => es.isMarked).length,
        total: examSubjects.length,
      },
    };
  }
}
