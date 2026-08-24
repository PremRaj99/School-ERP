import { Router } from 'express';
import { getTimeTables, updateTimeTable } from '../controllers/timetable.controller';
import {
  createAcademicCalendar,
  deleteAcademicCalendar,
  getAcademicCalendars,
} from '../controllers/academicCalendar.controller';
import { promoteClass } from '../controllers/promotion.controller';

export const academicRouter = Router();

academicRouter.get('/time-table', getTimeTables);
academicRouter.put('/time-table', updateTimeTable);

academicRouter.post('/promote', promoteClass);

academicRouter.get('/calendar', getAcademicCalendars);
academicRouter.post('/calendar', createAcademicCalendar);
academicRouter.delete('/calendar/:calendarId', deleteAcademicCalendar);

academicRouter.get('/', getAcademicCalendars);
academicRouter.post('/', createAcademicCalendar);
academicRouter.delete('/:calendarId', deleteAcademicCalendar);
