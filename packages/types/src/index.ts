import { academicCategory, CreatAacademicCalendarSchema } from "./types/academicCalendarSchema"
import { classNameSchema, sectionSchema, sessionSchema, CreateClassSchema } from "./types/classSchema"
import { CreateExamSchema } from "./types/examSchema"
import { targetRoleSchema, CreateNoticeSchema } from "./types/noticeSchema"
import { CreateStudentSchema, UpdateStudentSchema } from "./types/studentSchema"
import { subjectNameSchema, subjectCodeSchema, CreateSubjectSchema, UpdateSubjectSchema } from "./types/subjectSchema"
import { teacherIdSchema, studentIdSchema, CreateTeacherAttendanceSchema, UpdateTeacherAttendanceSchema } from "./types/teacherAttendanceSchema"
import { dateSchema, monthSchema, CreateTeacherSchema, UpdateTeacherSchema, aboutSchema } from "./types/teacherSchema"
import { weekDaySchema, periodSchema, UpdateTimeTableSchema } from "./types/timeTableSchema"
import { CreateClassAttendanceSchema } from "./types/createAttendanceSchema"
import { CreateResultSchema, UpdateResultSchema } from "./types/resultSchema"
import { ObjectIdSchema } from "./types/objectIdSchema"

export {
    academicCategory, CreatAacademicCalendarSchema,
    classNameSchema, sectionSchema, sessionSchema, CreateClassSchema,
    CreateExamSchema,
    targetRoleSchema, CreateNoticeSchema,
    CreateStudentSchema, UpdateStudentSchema,
    subjectNameSchema, subjectCodeSchema, CreateSubjectSchema, UpdateSubjectSchema,
    teacherIdSchema, studentIdSchema, CreateTeacherAttendanceSchema, UpdateTeacherAttendanceSchema,
    dateSchema, monthSchema, CreateTeacherSchema, UpdateTeacherSchema, aboutSchema,
    weekDaySchema, periodSchema, UpdateTimeTableSchema,
    CreateClassAttendanceSchema,
    CreateResultSchema, UpdateResultSchema,
    ObjectIdSchema
}

