import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import {
  getCurrentMonthString,
  getMonthStartEnd,
  getTodayDate,
  timeTableFormattedData,
} from '../helpers';

export class StudentService {
  static async getStudentProfile(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        dob: true,
        address: true,
        phone: true,
        fatherName: true,
        motherName: true,
        fatherOccupation: true,
        motherOccupation: true,
        studentAadhar: true,
        fatherAadhar: true,
        motherAadhar: true,
        class: {
          select: {
            className: true,
            section: true,
            session: true,
          },
        },
        dateOfAdmission: true,
        rollNo: true,
        appId: true,
        profilePhoto: true,
      },
    });

    if (!student) {
      throw new NotFoundError();
    }

    return {
      id: student.id,
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      dob: student.dob,
      address: student.address,
      phone: student.phone,
      fatherName: student.fatherName,
      motherName: student.motherName,
      fatherOccupation: student.fatherOccupation,
      motherOccupation: student.motherOccupation,
      studentAadhar: student.studentAadhar,
      fatherAadhar: student.fatherAadhar,
      motherAadhar: student.motherAadhar,
      className: student.class?.className,
      section: student.class?.section,
      session: student.class?.session,
      dateOfAdmission: student.dateOfAdmission,
      rollNo: student.rollNo,
      appId: student.appId,
      profilePhoto: student.profilePhoto,
    };
  }

  static async getAttendance(userId: string, month: string) {
    const { startDate, endDate } = getMonthStartEnd(month);

    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundError();
    }

    return await prisma.studentAttendance.findMany({
      where: {
        studentId: student.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        status: true,
      },
    });
  }

  static async getSubjects(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundError();
    }

    const timeTableEntries = await prisma.timeTable.findMany({
      where: { classId: student.classId },
      select: {
        subject: {
          select: {
            id: true,
            subjectName: true,
            subjectCode: true,
          },
        },
      },
    });

    const subjectsMap = new Map();
    timeTableEntries.forEach((entry) => {
      if (entry.subject) {
        subjectsMap.set(entry.subject.id, entry.subject);
      }
    });

    return Array.from(subjectsMap.values());
  }

  static async getExams(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundError();
    }

    return await prisma.exam.findMany({
      where: { classId: student.classId },
      select: {
        id: true,
        title: true,
        dateFrom: true,
        dateTo: true,
        isResultDecleared: true,
      },
    });
  }

  static async getNotices() {
    return await prisma.notice.findMany({
      where: {
        targetRole: { in: ['Student', 'All'] },
      },
      select: {
        id: true,
        title: true,
        date: true,
        targetRole: true,
      },
    });
  }

  static async getNoticeDetail(noticeId: string) {
    const notice = await prisma.notice.findFirst({
      where: {
        id: noticeId,
        targetRole: { in: ['Student', 'All'] },
      },
    });

    if (!notice) {
      throw new NotFoundError();
    }
    return notice;
  }

  static async getTimetables(userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
    });

    if (!student) {
      throw new NotFoundError();
    }

    const timeTable = await prisma.timeTable.findMany({
      where: { classId: student.classId },
      select: {
        class: {
          select: {
            className: true,
            section: true,
          },
        },
        teacher: {
          select: {
            teacherId: true,
            firstName: true,
            lastName: true,
          },
        },
        weekday: true,
        subject: {
          select: {
            subjectName: true,
            subjectCode: true,
          },
        },
        period: true,
      },
    });

    return timeTableFormattedData(timeTable);
  }

  static async getAcademicCalendar() {
    return await prisma.academicCalendar.findMany();
  }

  static async getDashboard(userId: string) {
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
        select: { id: true, title: true, date: true, targetRole: true },
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
        className: student.class?.className,
        section: student.class?.section,
        session: student.class?.session,
      },
      attendanceThisMonth: { present, absent, leave, total: present + absent + leave },
      upcomingExams,
      recentNotices,
      pendingFees: {
        count: pendingFees._count._all,
        totalAmount: pendingFees._sum.finalAmount ?? 0,
      },
    };
  }
}
