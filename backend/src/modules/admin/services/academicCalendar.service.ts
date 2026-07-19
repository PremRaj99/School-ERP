import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { getDateString } from '../helpers';
import { CreateAcademicCalendarInput } from '../types';

export class AdminAcademicCalendarService {
  static async getAcademicCalendars() {
    return await prisma.academicCalendar.findMany();
  }

  static async createAcademicCalendar(data: CreateAcademicCalendarInput) {
    return await prisma.academicCalendar.create({
      data: {
        date: getDateString(data.date),
        title: data.title,
        category: data.category,
      },
    });
  }

  static async deleteAcademicCalendar(calendarId: string) {
    try {
      await prisma.academicCalendar.delete({
        where: { id: calendarId },
      });
    } catch (e) {
      throw new NotFoundError();
    }
  }
}
