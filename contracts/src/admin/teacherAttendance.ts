import { z } from 'zod';
import { defineContract } from '../envelope';
import { ISODate, ISOMonth, ObjectId, TeacherId } from '../primitives';
import { AttendanceStatusEnum } from '../enums';

export const TeacherAttendanceRow = z.object({
  id: ObjectId,
  teacherId: TeacherId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  status: AttendanceStatusEnum,
});
export type TeacherAttendanceRow = z.infer<typeof TeacherAttendanceRow>;

export const TeacherAttendanceByDate = z.object({
  date: ISODate,
  teachers: z.array(TeacherAttendanceRow),
});
export type TeacherAttendanceByDate = z.infer<typeof TeacherAttendanceByDate>;

export const TeacherAttendanceByMonth = z.object({
  teacherId: TeacherId,
  firstName: z.string(),
  lastName: z.string().nullable(),
  attendance: z.array(z.object({ date: ISODate, status: AttendanceStatusEnum })),
});
export type TeacherAttendanceByMonth = z.infer<typeof TeacherAttendanceByMonth>;

export const MarkTeacherAttendanceBody = z.array(
  z.object({
    teacherId: TeacherId,
    status: z.enum(['Present', 'Absent']),
  }),
);
export type MarkTeacherAttendanceBody = z.infer<typeof MarkTeacherAttendanceBody>;

export const UpdateTeacherAttendanceBody = z.array(
  z.object({
    id: ObjectId,
    teacherId: TeacherId,
    status: z.enum(['Present', 'Absent']),
  }),
);
export type UpdateTeacherAttendanceBody = z.infer<typeof UpdateTeacherAttendanceBody>;

export const adminTeacherAttendanceContract = defineContract({
  getByDate: {
    method: 'GET',
    path: '/admin/attendance/teacher-attendance',
    query: z.object({ date: ISODate }),
    response: TeacherAttendanceByDate,
  },
  getByMonth: {
    method: 'GET',
    path: '/admin/attendance/teacher-attendance/:teacherId',
    params: z.object({ teacherId: TeacherId }),
    query: z.object({ month: ISOMonth }),
    response: TeacherAttendanceByMonth,
  },
  mark: {
    method: 'POST',
    path: '/admin/attendance/teacher-attendance',
    query: z.object({ date: ISODate }),
    body: MarkTeacherAttendanceBody,
    response: TeacherAttendanceByDate,
    successStatus: 201,
  },
  update: {
    method: 'PUT',
    path: '/admin/attendance/teacher-attendance',
    body: UpdateTeacherAttendanceBody,
    response: z.array(TeacherAttendanceRow),
    successStatus: 202,
  },
} as const);
