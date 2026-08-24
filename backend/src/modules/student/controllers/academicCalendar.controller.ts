import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { StudentService } from '../services/student.service';

export const getAcademicCalendars = defineRoute(studentContract.calendar, async () => {
  return StudentService.getAcademicCalendar();
});
