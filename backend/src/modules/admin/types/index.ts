import { z } from 'zod';
import {
  ObjectIdSchema,
  dateSchema,
  monthSchema,
  classNameSchema,
  sectionSchema,
  sessionSchema,
} from '@/shared/types';

// Re-export shared schemas so module consumers can import from here
export { ObjectIdSchema, dateSchema, monthSchema, classNameSchema, sectionSchema, sessionSchema };

const aboutSchema = z.string().min(20, 'About section must be at least 20 characters long.');

// Teacher
export const teacherIdSchema = z
  .string({ message: 'teacherId is required' })
  .regex(/^TCH\d{8}$/, 'Invalid Teacher ID.');

export const CreateTeacherSchema = z.object({
  firstName: z
    .string({ message: 'First name is required.' })
    .min(2, 'First name must be at least 2 characters long.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters long.').optional(),
  dob: dateSchema,
  address: z.string().min(10, 'Address must be at least 10 characters long.').optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number.'),
  teacherAadhar: z
    .string()
    .regex(/^\d{12}$/, { message: 'invalid aadhar' })
    .optional(),
  dateOfJoining: dateSchema,
  about: aboutSchema.optional(),
  salaryPerMonth: z
    .number({ message: 'Salary is required.' })
    .positive('Salary must be a positive number.'),
  qualifications: z
    .string({ message: 'Qualifications are required.' })
    .min(2, 'Qualifications must be at least 2 characters long.'),
  subjectsHandled: z
    .array(z.string().min(2, 'Each subject must be at least 2 characters long.'), {
      message: 'Subjects handled are required.',
    })
    .min(1, 'At least one subject must be provided.'),
  profilePhoto: z.string().url('Please provide a valid URL for the profile photo.').optional(),
});

export const UpdateTeacherSchema = CreateTeacherSchema.partial();

// Student
export const studentIdSchema = z
  .string({ message: 'studentId is required' })
  .regex(/^STU\d{8}$/, 'Invalid Student ID.');

export const CreateStudentSchema = z.object({
  firstName: z
    .string({ message: 'First name is required.' })
    .min(2, 'First name must be at least 2 characters long.'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters long.').optional(),
  dob: dateSchema,
  address: z.string().min(10, 'Address must be at least 10 characters long.').optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number.'),
  fatherName: z.string().min(2, 'Last name must be at least 2 characters long.').optional(),
  motherName: z.string().min(2, 'Last name must be at least 2 characters long.').optional(),
  fatherOccupation: z.string().min(2, 'Last name must be at least 2 characters long.').optional(),
  motherOccupation: z.string().min(2, 'Last name must be at least 2 characters long.').optional(),
  studentAadhar: z
    .string()
    .regex(/^\d{12}$/, { message: 'invalid aadhar' })
    .optional(),
  fatherAadhar: z
    .string()
    .regex(/^\d{12}$/, { message: 'invalid aadhar' })
    .optional(),
  motherAadhar: z
    .string()
    .regex(/^\d{12}$/, { message: 'invalid aadhar' })
    .optional(),
  className: classNameSchema,
  section: sectionSchema,
  session: sessionSchema,
  dateOfAdmission: dateSchema,
  rollNo: z
    .number({ message: 'Roll No is required.' })
    .positive('Roll No must be a positive number.'),
  appId: z.string().min(5, 'ApparId must be at least 5 characters long.').optional(),
  profilePhoto: z.string().url('Please provide a valid URL for the profile photo.').optional(),
});

export const UpdateStudentSchema = CreateStudentSchema.partial();

// Class
export const CreateClassSchema = z.object({
  className: classNameSchema,
  section: sectionSchema,
  session: sessionSchema,
});

// Subject
export const subjectNameSchema = z
  .string({ message: 'Subject Name is required' })
  .min(2, 'Subject must be atleast 2 digit long')
  .trim();
export const subjectCodeSchema = z
  .string({ message: 'Subject Code is required' })
  .length(6, { message: 'Subject code must be exactly 6 characters long.' })
  .regex(/^[A-Z]{3}[0-9]{3}$/, { message: 'Invalid Subject Code.' });

export const CreateSubjectSchema = z.object({
  subjectName: subjectNameSchema,
  className: classNameSchema,
});

export const UpdateSubjectSchema = z.object({
  subjectName: subjectNameSchema,
});

// Academic Calendar
export const academicCategory = z.enum(['HOLIDAY', 'EVENT', 'EXAM', 'OTHER']);
export const CreatAacademicCalendarSchema = z.object({
  date: dateSchema,
  title: z
    .string({ message: 'Title is required.' })
    .min(2, 'Title should be atleast 2 character long.'),
  category: academicCategory,
});

// Notice
export const targetRoleSchema = z.enum(['Student', 'Teacher', 'All']);
export const CreateNoticeSchema = z.object({
  description: z.string().min(50, 'Description has to be atleast 50 character long.').optional(),
  fileUrl: z.string().url('Please provide a valid URL for the file URL.').optional(),
  date: dateSchema,
  title: z
    .string({ message: 'Title is required.' })
    .min(2, 'Title must be atleast 2 character long.'),
  targetRole: targetRoleSchema,
  expiryDate: dateSchema.optional(),
});

// Teacher Attendance
export const CreateTeacherAttendanceSchema = z.array(
  z.object({
    teacherId: teacherIdSchema,
    status: z.enum(['Present', 'Absent']),
  }),
);

export const UpdateTeacherAttendanceSchema = z.array(
  z.object({
    id: z.string(),
    teacherId: teacherIdSchema,
    status: z.enum(['Present', 'Absent']),
  }),
);

// Class Attendance
export const CreateClassAttendanceSchema = z.object({
  date: dateSchema,
  className: classNameSchema,
  section: sectionSchema,
  attendance: z.array(
    z.object({
      studentId: z
        .string({ message: 'StudentId is required.' })
        .min(3, 'StudentId should be atleast 3 characters long.'),
      status: z.enum(['Present', 'Absent']),
    }),
  ),
});

export const UpdateClassAttendanceSchema = z.array(
  z.object({
    id: z.string({ message: 'Id is required.' }).min(3, 'Id should be atleast 3 characters long.'),
    studentId: z
      .string({ message: 'StudentId is required.' })
      .min(3, 'StudentId should be atleast 3 characters long.'),
    status: z.enum(['Present', 'Absent']),
  }),
);

// Exam
export const CreateExamSchema = z.object({
  dateFrom: dateSchema,
  dateTo: dateSchema,
  title: z
    .string({ message: 'Exam Title is required' })
    .min(3, 'Exam Title must be greater then 3 character.'),
  exams: z.array(
    z.object({
      className: classNameSchema,
      section: sectionSchema,
      subjects: z.array(
        z.object({
          subjectCode: subjectCodeSchema,
          date: dateSchema,
          fullMarks: z
            .number({ message: 'Full Marks is Required' })
            .nonnegative({ message: 'Full Marks cannot be negative' })
            .max(100, { message: 'full Marks must be less then or 100' }),
        }),
      ),
    }),
  ),
});

// Result
export const CreateResultSchema = z.array(
  z.object({
    studentId: z
      .string({ message: 'StudentId is required' })
      .min(3, 'Student must be greater then 3 character.'),
    marksObtained: z
      .number({ message: 'Marks is required.' })
      .nonnegative({ message: 'Marks should be greater then 0.' }),
    remark: z.string().optional(),
  }),
);

export const UpdateResultSchema = z.array(
  z.object({
    id: z.string({ message: 'Id is required' }).min(3, 'Id must be greater then 3 character.'),
    studentId: z
      .string({ message: 'StudentId is required' })
      .min(3, 'Student must be greater then 3 character.'),
    marksObtained: z
      .number({ message: 'Marks is required.' })
      .nonnegative({ message: 'Marks should be greater then 0.' }),
    remark: z.string().optional(),
  }),
);

// TimeTable
export const weekDaySchema = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'], {
  message: 'invalid Weekday',
});
export const periodSchema = z.number().int().min(1, 'invalid period').max(8, 'invalid period');

export const UpdateTimeTableSchema = z.object({
  className: classNameSchema,
  section: sectionSchema,
  weekday: weekDaySchema,
  period: periodSchema,
  subjectCode: subjectCodeSchema.optional(),
  teacherId: teacherIdSchema.optional(),
});

// TypeScript types
export type CreateTeacherInput = z.infer<typeof CreateTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof UpdateTeacherSchema>;
export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;
export type CreateClassInput = z.infer<typeof CreateClassSchema>;
export type CreateSubjectInput = z.infer<typeof CreateSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof UpdateSubjectSchema>;
export type CreateNoticeInput = z.infer<typeof CreateNoticeSchema>;
export type CreateAcademicCalendarInput = z.infer<typeof CreatAacademicCalendarSchema>;
export type UpdateTimeTableInput = z.infer<typeof UpdateTimeTableSchema>;
