import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { timeTableFormattedData } from '../helpers';
import { z } from 'zod';
import { CreateClassAttendanceSchema, UpdateClassAttendanceSchema } from '../types';

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
}
