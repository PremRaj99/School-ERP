import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { timeTableFormattedData } from '../helpers';
import type { ClassSchedule, TimeTableSlotRecord, UpdateTimeTableBody } from '@schoolerp/contracts';
import { getCurrentSessionYear } from '@/shared';

export class AdminTimetableService {
  static async getTimeTables(): Promise<ClassSchedule[]> {
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

  static async updateTimeTable(data: UpdateTimeTableBody): Promise<TimeTableSlotRecord> {
    // Was `findFirst({ className, section })` with no session — if the same className+section
    // pair exists across more than one session (a school's normal year-to-year rollover), this
    // could silently edit the wrong session's class (ALIGNMENT_PLAN.md 2A/B8). Scoped to the
    // current session, matching how `createClassAttendance`/`storeExamData` already do this.
    const currentSession = getCurrentSessionYear();
    const classRecord = await prisma.class.findUnique({
      where: {
        className_section_session: {
          className: data.className,
          section: data.section,
          session: currentSession,
        },
      },
    });

    if (!classRecord) {
      throw new NotFoundError(
        `Class ${data.className}-${data.section} for session ${currentSession} does not exist.`,
      );
    }

    let subject;
    if (data.subjectCode) {
      subject = await prisma.subject.findUnique({ where: { subjectCode: data.subjectCode } });
    }

    let teacher;
    if (data.teacherId) {
      teacher = await prisma.teacher.findUnique({ where: { teacherId: data.teacherId } });
    }

    try {
      await prisma.timeTable.update({
        where: {
          classId_weekday_period: {
            classId: classRecord.id,
            weekday: data.weekday,
            period: data.period,
          },
        },
        data: {
          teacherId: teacher?.id,
          subjectId: subject?.id,
        },
      });
    } catch (_e) {
      if (!subject || !teacher) {
        throw new NotFoundError(
          'Both a subjectCode and a teacherId are required to create a new slot.',
        );
      }

      await prisma.timeTable.create({
        data: {
          period: data.period,
          weekday: data.weekday,
          classId: classRecord.id,
          subjectId: subject.id,
          teacherId: teacher.id,
        },
      });
    }

    const slot = await prisma.timeTable.findUniqueOrThrow({
      where: {
        classId_weekday_period: {
          classId: classRecord.id,
          weekday: data.weekday,
          period: data.period,
        },
      },
      select: {
        weekday: true,
        period: true,
        subject: { select: { subjectCode: true, subjectName: true } },
        teacher: { select: { teacherId: true, firstName: true, lastName: true } },
      },
    });

    return {
      className: data.className,
      section: data.section,
      weekday: slot.weekday,
      period: slot.period,
      subjectCode: slot.subject.subjectCode,
      subjectName: slot.subject.subjectName,
      teacherId: slot.teacher.teacherId,
      teacherFullName: `${slot.teacher.firstName} ${slot.teacher.lastName ?? ''}`.trim(),
    };
  }
}
