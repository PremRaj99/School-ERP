import { Router } from 'express';
import {
  getTeacherAttendanceForDate,
  getTeacherAttendanceForMonth,
  markTeacherAttendanceForDate,
  updateTeacherAttendanceForDate
} from '../controllers/teacherAttendance.controller';

export const attendanceRouter = Router();

attendanceRouter.get("/teacher-attendance", getTeacherAttendanceForDate);
attendanceRouter.get("/teacher-attendance/:teacherId", getTeacherAttendanceForMonth);
attendanceRouter.post("/teacher-attendance", markTeacherAttendanceForDate);
attendanceRouter.put("/teacher-attendance", updateTeacherAttendanceForDate);
