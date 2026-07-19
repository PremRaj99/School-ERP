import prisma from "@/core/db";
import { NotFoundError } from "@/core/errors";
import { timeTableFormattedData } from "../helpers";
import { UpdateTimeTableInput } from "../types";

export class AdminTimetableService {
  static async getTimeTables() {
    const timeTable = await prisma.timeTable.findMany({
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

  static async updateTimeTable(data: UpdateTimeTableInput) {
    const className = await prisma.class.findFirst({
      where: {
        className: data.className,
        section: data.section,
      },
    });

    if (!className) {
      throw new NotFoundError();
    }

    let subject;
    if (data.subjectCode) {
      subject = await prisma.subject.findUnique({ where: { subjectCode: data.subjectCode } });
    }

    let teacher;
    if (data.teacherId) {
      teacher = await prisma.teacher.findUnique({
        where: { teacherId: data.teacherId },
      });
    }

    try {
      await prisma.timeTable.update({
        where: {
          classId_weekday_period: {
            classId: className.id,
            weekday: data.weekday,
            period: data.period,
          },
        },
        data: {
          teacherId: teacher?.id,
          subjectId: subject?.id,
        },
      });
    } catch (e) {
      if (!subject || !teacher) {
        throw new NotFoundError();
      }

      await prisma.timeTable.create({
        data: {
          period: data.period,
          weekday: data.weekday,
          classId: className.id,
          subjectId: subject.id,
          teacherId: teacher.id,
        },
      });
    }
  }
}
