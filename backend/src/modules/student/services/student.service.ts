import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import {
  getCurrentMonthString,
  getMonthStartEnd,
  getTodayDate,
  timeTableFormattedData,
} from '../helpers';
import type {
  StudentAnalytics,
  StudentAttendanceDay,
  StudentDashboard,
  StudentExamSummary,
  StudentRecord,
  SubjectRecord,
} from '@schoolerp/contracts';
import { monthStartEndFromISO, toISODate, toISOMonth } from '@/shared/helpers/isoDate';

export class StudentService {
  static async getStudentProfile(userId: string): Promise<StudentRecord> {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        dob: true,
        gender: true,
        address: true,
        phone: true,
        fatherName: true,
        motherName: true,
        fatherOccupation: true,
        motherOccupation: true,
        studentAadhar: true,
        fatherAadhar: true,
        motherAadhar: true,
        class: { select: { className: true, section: true, session: true } },
        dateOfAdmission: true,
        rollNo: true,
        appId: true,
        penNumber: true,
        profilePhoto: true,
        status: true,
        user: { select: { username: true } },
      },
    });

    if (!student) {
      throw new NotFoundError();
    }

    return {
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      dob: toISODate(student.dob),
      gender: student.gender ?? null,
      address: student.address,
      phone: student.phone,
      fatherName: student.fatherName,
      motherName: student.motherName,
      fatherOccupation: student.fatherOccupation,
      motherOccupation: student.motherOccupation,
      studentAadhar: student.studentAadhar,
      fatherAadhar: student.fatherAadhar,
      motherAadhar: student.motherAadhar,
      className: student.class?.className ?? '',
      section: student.class?.section ?? '',
      session: student.class?.session ?? '',
      dateOfAdmission: toISODate(student.dateOfAdmission),
      rollNo: student.rollNo,
      appId: student.appId,
      penNumber: student.penNumber,
      profilePhoto: student.profilePhoto,
      username: student.user?.username ?? '',
      // Pre-D5 documents have no `status` key at all — see the admin student service's
      // `toStudentRecord` for the full explanation of why this can't just rely on the schema
      // `@default`.
      status: student.status ?? 'Active',
    };
  }

  static async getAttendance(userId: string, month: string): Promise<StudentAttendanceDay[]> {
    const { startDate, endDate } = monthStartEndFromISO(month);

    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new NotFoundError();
    }

    const records = await prisma.studentAttendance.findMany({
      where: { studentId: student.id, date: { gte: startDate, lte: endDate } },
      select: { date: true, status: true },
    });

    return records.map((r) => ({ date: toISODate(r.date), status: r.status }));
  }

  static async getSubjects(userId: string): Promise<SubjectRecord[]> {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new NotFoundError();
    }

    const timeTableEntries = await prisma.timeTable.findMany({
      where: { classId: student.classId },
      select: { subject: { select: { subjectCode: true, subjectName: true } } },
    });

    const subjectsMap = new Map<string, SubjectRecord>();
    timeTableEntries.forEach((entry) => {
      subjectsMap.set(entry.subject.subjectCode, entry.subject);
    });

    return Array.from(subjectsMap.values());
  }

  static async getExams(userId: string): Promise<StudentExamSummary[]> {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new NotFoundError();
    }

    const exams = await prisma.exam.findMany({
      where: { classId: student.classId },
      select: { id: true, title: true, dateFrom: true, dateTo: true, isResultDecleared: true },
    });

    return exams.map((e) => ({
      id: e.id,
      title: e.title,
      dateFrom: toISODate(e.dateFrom),
      dateTo: e.dateTo ? toISODate(e.dateTo) : null,
      isResultDecleared: e.isResultDecleared,
    }));
  }

  static async getNotices() {
    const notices = await prisma.notice.findMany({
      where: { targetRole: { in: ['Student', 'All'] } },
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
      where: { id: noticeId, targetRole: { in: ['Student', 'All'] } },
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

  static async getTimetables(userId: string) {
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) {
      throw new NotFoundError();
    }

    const timeTable = await prisma.timeTable.findMany({
      where: { classId: student.classId },
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

  static async getAcademicCalendar() {
    const events = await prisma.academicCalendar.findMany();
    return events.map((e) => ({
      id: e.id,
      title: e.title,
      date: toISODate(e.date),
      category: e.category,
    }));
  }

  static async getDashboard(userId: string): Promise<StudentDashboard> {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        studentId: true,
        firstName: true,
        lastName: true,
        rollNo: true,
        profilePhoto: true,
        classId: true,
        id: true,
        class: { select: { className: true, section: true, session: true } },
      },
    });

    if (!student) {
      throw new NotFoundError();
    }

    const today = getTodayDate();
    const { startDate, endDate } = getMonthStartEnd(getCurrentMonthString());

    const [attendanceGroups, upcomingExams, recentNotices, pendingFees] = await Promise.all([
      prisma.studentAttendance.groupBy({
        by: ['status'],
        where: { studentId: student.id, date: { gte: startDate, lt: endDate } },
        _count: { _all: true },
      }),
      prisma.exam.findMany({
        where: { classId: student.classId, dateFrom: { gte: today } },
        orderBy: { dateFrom: 'asc' },
        take: 5,
        select: { id: true, title: true, dateFrom: true, dateTo: true },
      }),
      prisma.notice.findMany({
        where: { targetRole: { in: ['Student', 'All'] } },
        orderBy: { date: 'desc' },
        take: 5,
        select: { id: true, title: true, date: true, targetRole: true, expiryDate: true },
      }),
      prisma.transaction.aggregate({
        where: { status: 'Pending', studentFee: { studentId: student.id } },
        _count: { _all: true },
        _sum: { finalAmount: true },
      }),
    ]);

    const present = attendanceGroups.find((a) => a.status === 'Present')?._count._all ?? 0;
    const absent = attendanceGroups.find((a) => a.status === 'Absent')?._count._all ?? 0;
    const leave = attendanceGroups.find((a) => a.status === 'Leave')?._count._all ?? 0;

    return {
      profile: {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        rollNo: student.rollNo,
        profilePhoto: student.profilePhoto,
        className: student.class?.className ?? '',
        section: student.class?.section ?? '',
        session: student.class?.session ?? '',
      },
      attendanceThisMonth: { present, absent, leave, total: present + absent + leave },
      upcomingExams: upcomingExams.map((e) => ({
        id: e.id,
        title: e.title,
        dateFrom: toISODate(e.dateFrom),
        dateTo: e.dateTo ? toISODate(e.dateTo) : null,
      })),
      recentNotices: recentNotices.map((n) => ({
        id: n.id,
        title: n.title,
        date: toISODate(n.date),
        targetRole: n.targetRole,
        expiryDate: n.expiryDate ? toISODate(n.expiryDate) : null,
      })),
      pendingFees: {
        count: pendingFees._count._all,
        totalAmount: pendingFees._sum.finalAmount ?? 0,
      },
    };
  }

  static async getAnalytics(userId: string): Promise<StudentAnalytics> {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: { id: true, classId: true },
    });
    if (!student) {
      throw new NotFoundError();
    }

    const [attendanceRows, myResults, feeRecords] = await Promise.all([
      prisma.studentAttendance.findMany({
        where: { studentId: student.id },
        select: { date: true, status: true },
      }),
      prisma.examResult.findMany({
        where: { studentId: student.id },
        include: { examSubject: { include: { subject: true, exam: true } } },
        orderBy: { examSubject: { date: 'asc' } },
      }),
      prisma.studentFee.findMany({
        where: { studentId: student.id },
        include: { transaction: true },
      }),
    ]);

    const attMap = new Map<string, { present: number; total: number }>();
    for (const r of attendanceRows) {
      const month = toISOMonth(r.date);
      const entry = attMap.get(month) ?? { present: 0, total: 0 };
      entry.total += 1;
      if (r.status === 'Present') entry.present += 1;
      attMap.set(month, entry);
    }
    const attendanceTrend = Array.from(attMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, { present, total }]) => ({
        month,
        presentPct: total > 0 ? (present / total) * 100 : 0,
      }));

    // Only exams whose results have actually been declared — an undeclared exam's marks shouldn't
    // leak into a student's own analytics before the admin publishes them.
    const declaredResults = myResults.filter((r) => r.examSubject.exam.isResultDecleared);

    const subjectMarks = declaredResults.map((r) => ({
      subjectCode: r.examSubject.subject.subjectCode,
      subjectName: r.examSubject.subject.subjectName,
      examTitle: r.examSubject.exam.title,
      date: toISODate(r.examSubject.date),
      pct: (r.marksObtained / r.examSubject.fullMarks) * 100,
    }));

    const byExam = new Map<string, typeof declaredResults>();
    for (const r of declaredResults) {
      const list = byExam.get(r.examSubject.examId) ?? [];
      list.push(r);
      byExam.set(r.examSubject.examId, list);
    }
    const examEntries = Array.from(byExam.entries())
      .map(([examId, results]) => {
        const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
        const totalMax = results.reduce((sum, r) => sum + r.examSubject.fullMarks, 0);
        return {
          examId,
          examTitle: results[0]!.examSubject.exam.title,
          date: results[0]!.examSubject.date,
          results,
          avgPct: totalMax > 0 ? (totalObtained / totalMax) * 100 : 0,
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const gradeHistory = examEntries.map((e) => ({
      examTitle: e.examTitle,
      date: toISODate(e.date),
      averagePct: e.avgPct,
    }));

    const rankTrend = await Promise.all(
      examEntries.map(async (e) => {
        const classResults = await prisma.examResult.findMany({
          where: { examSubject: { examId: e.examId }, student: { classId: student.classId } },
          select: { studentId: true, marksObtained: true },
        });
        const totals = new Map<string, number>();
        for (const r of classResults) {
          totals.set(r.studentId, (totals.get(r.studentId) ?? 0) + r.marksObtained);
        }
        const sorted = Array.from(totals.entries()).sort(([, a], [, b]) => b - a);
        const rank = sorted.findIndex(([sid]) => sid === student.id) + 1;
        return {
          examTitle: e.examTitle,
          date: toISODate(e.date),
          rank: rank || sorted.length,
          classSize: sorted.length,
        };
      }),
    );

    const latestExam = examEntries[examEntries.length - 1];
    const latestExamBreakdown = latestExam
      ? latestExam.results.map((r) => ({
          subjectCode: r.examSubject.subject.subjectCode,
          subjectName: r.examSubject.subject.subjectName,
          pct: (r.marksObtained / r.examSubject.fullMarks) * 100,
        }))
      : null;

    const feeMap = new Map<string, { paid: number; pending: number }>();
    for (const f of feeRecords) {
      const month = toISOMonth(f.month);
      const entry = feeMap.get(month) ?? { paid: 0, pending: 0 };
      if (f.transaction.status === 'Paid') entry.paid += f.transaction.finalAmount;
      else if (f.transaction.status === 'Pending') entry.pending += f.transaction.finalAmount;
      feeMap.set(month, entry);
    }
    const feeHistory = Array.from(feeMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, ...v }));

    return {
      attendanceTrend,
      subjectMarks,
      latestExamBreakdown,
      gradeHistory,
      rankTrend,
      feeHistory,
    };
  }
}
