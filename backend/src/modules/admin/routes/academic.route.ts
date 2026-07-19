import { Router } from 'express';
import { getTimeTables, updateTimeTable } from '../controllers/timetable.controller';
import { createAcademicCalendar, deleteAcademicCalendar, getAcademicCalendars } from '../controllers/academicCalendar.controller';

export const academicRouter = Router();

academicRouter.get("/time-table", getTimeTables);
academicRouter.put("/time-table", updateTimeTable);

academicRouter.get("/calendar", getAcademicCalendars);
academicRouter.post("/calendar", createAcademicCalendar);
academicRouter.delete("/calendar/:calendarId", deleteAcademicCalendar);
