import { adminAcademicCalendarContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminAcademicCalendarService } from '../services/academicCalendar.service';

export const getAcademicCalendars = defineRoute(adminAcademicCalendarContract.list, async () => {
  return AdminAcademicCalendarService.getAcademicCalendars();
});

export const createAcademicCalendar = defineRoute(
  adminAcademicCalendarContract.create,
  async ({ body }) => {
    return AdminAcademicCalendarService.createAcademicCalendar(body);
  },
);

export const deleteAcademicCalendar = defineRoute(
  adminAcademicCalendarContract.remove,
  async ({ params }) => {
    return AdminAcademicCalendarService.deleteAcademicCalendar(params.calendarId);
  },
);
