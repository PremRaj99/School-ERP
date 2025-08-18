import { Router } from 'express';
import { getAttendance } from '../../controllers/attendance.controller';
export const attendanceRouter = Router()

attendanceRouter.get("/", getAttendance)
