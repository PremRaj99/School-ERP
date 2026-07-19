import { Router } from 'express';
import { getTimeTables } from '../controllers/timetable.controller';
import { getAcademicCalendars } from '../controllers/academicCalendar.controller';

export const academicRouter = Router();

academicRouter.get("/time-table", getTimeTables);
academicRouter.get("/calendar", getAcademicCalendars);
