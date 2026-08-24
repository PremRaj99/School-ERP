import { z } from 'zod';
import { defineContract } from '../envelope';
import { ISODate, ObjectId } from '../primitives';
import { AcademicCalendarCategoryEnum } from '../enums';

export const CalendarEventRecord = z.object({
  id: ObjectId,
  title: z.string(),
  date: ISODate,
  category: AcademicCalendarCategoryEnum,
});
export type CalendarEventRecord = z.infer<typeof CalendarEventRecord>;

export const CreateCalendarEventBody = z.object({
  title: z
    .string({ message: 'Title is required.' })
    .min(2, 'Title should be at least 2 characters long.'),
  date: ISODate,
  category: AcademicCalendarCategoryEnum,
});
export type CreateCalendarEventBody = z.infer<typeof CreateCalendarEventBody>;

export const DeleteCalendarEventResponse = z.object({ id: ObjectId });

export const adminAcademicCalendarContract = defineContract({
  list: {
    method: 'GET',
    path: '/admin/academic/calendar',
    response: z.array(CalendarEventRecord),
  },
  create: {
    method: 'POST',
    path: '/admin/academic/calendar',
    body: CreateCalendarEventBody,
    response: CalendarEventRecord,
    successStatus: 201,
  },
  remove: {
    method: 'DELETE',
    path: '/admin/academic/calendar/:calendarId',
    params: z.object({ calendarId: ObjectId }),
    response: DeleteCalendarEventResponse,
    successStatus: 202,
  },
} as const);
