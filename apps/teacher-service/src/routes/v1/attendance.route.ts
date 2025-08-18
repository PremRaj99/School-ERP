import { Router } from 'express';
import { createClassAttendance, getClassAttendance, getClassAttendanceDetail, updateClassAttendance, getTeacherAttendance } from '../../controllers/attendance.controller';
export const attendanceRouter = Router()

attendanceRouter.get("/", getTeacherAttendance)
attendanceRouter.get("/class-attendance", getClassAttendance)
attendanceRouter.get("/class-attendance/:classAttendanceId", getClassAttendanceDetail)
attendanceRouter.post("/class-attendance", createClassAttendance)
attendanceRouter.put("/class-attendance/classAttendanceId", updateClassAttendance)
