import { Router } from 'express';
import { getTimeTables } from '../../controllers/timetable.controller';
import { getAcademicCalenderEvent } from '../../controllers/academicCalendar.conroller';
export const academicRouter = Router()

academicRouter.get("/time-table", getTimeTables)

academicRouter.get("/calendar", getAcademicCalenderEvent)