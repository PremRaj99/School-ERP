import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import {
  getCurrentMonthString,
  getMonthStartEnd,
  getTodayDate,
  timeTableFormattedData,
} from '../helpers';
import { z } from 'zod';
import { CreateClassAttendanceSchema, UpdateClassAttendanceSchema } from '../types';

const WEEKDAY_BY_JS_DAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

export class TeacherService {
  static async getTeacherProfile(userId: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: {
        id: true,
        teacherId: true,
        firstName: true,
        lastName: true,
        dob: true,
        address: true,
        phone: true,
        teacherAadhar: true,
        dateOfJoining: true,
        about: true,
        salaryPerMonth: true,
        qualifications: true,
        subjectHandled: true,
        profilePhoto: true,
      },
    });

    if (!teacher) {
      throw new NotFoundError();
    }
    return teacher;
  }

  static async getTimetables(userId: string) {
    const timeTable = await prisma.timeTable.findMany({
      where: {
        teacher: {
          userId,
        },
      },
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

  static async getNotices() {
    return await prisma.notice.findMany({
      where: {
        targetRole: { in: ['Teacher', 'All'] },
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
        targetRole: { in: ['Teacher', 'All'] },
      },
    });

    if (!notice) {
      throw new NotFoundError();
    }
    return notice;
  }

  static async getAcademicCalendar() {
    return await prisma.academicCalendar.findMany();
  }

  static async markStudentAttendance(data: z.infer<typeof CreateClassAttendanceSchema>) {
    const classRecord = await prisma.class.findFirst({
      where: {
        className: data.className,
        section: data.section,
      },
    });

    if (!classRecord) {
      throw new NotFoundError();
    }

    await prisma.$transaction(async (tx) => {
      for (const item of data.attendance) {
        const student = await tx.student.findFirst({
          where: {
            OR: [{ id: item.studentId }, { studentId: item.studentId }],
          },
        });

        if (!student) {
          throw new NotFoundError();
        }

        // Upsert per-student attendance record
        await tx.studentAttendance.upsert({
          where: {
            studentId_date: {
              studentId: student.id,
              date: data.date,
            },
          },
          update: {
            status: item.status,
          },
          create: {
            studentId: student.id,
            date: data.date,
            status: item.status,
          },
        });
      }

      // Mark class attendance as marked for that date
      await tx.classAttendance.upsert({
        where: {
          date_classId: {
            date: data.date,
            classId: classRecord.id,
          },
        },
        update: { isMarked: true },
        create: {
          classId: classRecord.id,
          date: data.date,
          isMarked: true,
        },
      });
    });
  }

  static async updateStudentAttendance(attendance: z.infer<typeof UpdateClassAttendanceSchema>) {
    await prisma.$transaction(async (tx) => {
      for (const item of attendance) {
        await tx.studentAttendance.update({
          where: { id: item.id },
          data: { status: item.status },
        });
      }
    });
  }

  static async getDashboard(userId: string) {
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
          select: { id: true, title: true, date: true, targetRole: true },
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
        date: entry.date,
      })),
      recentNotices,
      pendingSalary: {
        count: pendingSalary._count._all,
        totalAmount: pendingSalary._sum.finalAmount ?? 0,
      },
    };
  }
}
