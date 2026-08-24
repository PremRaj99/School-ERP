import { teacherContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { TeacherService } from '../services/teacher.service';

export const getAcademicCalendars = defineRoute(teacherContract.academicCalendar, async () => {
  return TeacherService.getAcademicCalendar();
});
