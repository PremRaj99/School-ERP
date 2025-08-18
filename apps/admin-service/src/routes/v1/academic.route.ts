import { Router } from 'express';
import { getTimeTables, updateTimeTable } from '../../controllers/timetable.controller';
import { createAcademicCalender, deleteAcademicCalendar, getAcademicCalenderEvent } from '../../controllers/academicCalendar.conroller';
export const academicRouter = Router()

academicRouter.get("/time-table", getTimeTables)
academicRouter.put("/time-table", updateTimeTable)

academicRouter.get("/calendar", getAcademicCalenderEvent)
academicRouter.post("/calendar", createAcademicCalender)
academicRouter.delete("/calender/:calendarId", deleteAcademicCalendar)