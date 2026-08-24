import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import type { CalendarEventRecord, CreateCalendarEventBody } from '@schoolerp/contracts';
import { fromISODate, toISODate } from '@/shared/helpers/isoDate';

const toCalendarRecord = (event: {
  id: string;
  title: string;
  date: Date;
  category: 'HOLIDAY' | 'EVENT' | 'EXAM' | 'OTHER';
}): CalendarEventRecord => ({
  id: event.id,
  title: event.title,
  date: toISODate(event.date),
  category: event.category,
});

export class AdminAcademicCalendarService {
  static async getAcademicCalendars(): Promise<CalendarEventRecord[]> {
    const events = await prisma.academicCalendar.findMany();
    return events.map(toCalendarRecord);
  }

  static async createAcademicCalendar(data: CreateCalendarEventBody): Promise<CalendarEventRecord> {
    const event = await prisma.academicCalendar.create({
      data: {
        date: fromISODate(data.date),
        title: data.title,
        category: data.category,
      },
    });
    return toCalendarRecord(event);
  }

  static async deleteAcademicCalendar(calendarId: string): Promise<{ id: string }> {
    try {
      await prisma.academicCalendar.delete({ where: { id: calendarId } });
    } catch (_e) {
      throw new NotFoundError();
    }
    return { id: calendarId };
  }
}
