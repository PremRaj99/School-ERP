import { Router } from 'express';
import { createTeacherAttendance, getTeacherAttendance, updateTeacherAttendance } from '../../controllers/teacherAttendance.controller';
export const attendanceRouter = Router()

attendanceRouter.get("/teacher-attendance", getTeacherAttendance)
attendanceRouter.post("/teacher-attendance", createTeacherAttendance)
attendanceRouter.put("/teacher-attendance", updateTeacherAttendance)
