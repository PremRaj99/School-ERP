import { z } from "zod";
import {
  ObjectIdSchema,
  dateSchema,
  monthSchema,
  classNameSchema,
  sectionSchema,
} from "@/shared/types";

// Re-export shared primitives
export { ObjectIdSchema, dateSchema, monthSchema, classNameSchema, sectionSchema };

// Class Attendance schemas (teacher-owned)
export const CreateClassAttendanceSchema = z.object({
  date: dateSchema,
  className: classNameSchema,
  section: sectionSchema,
  attendance: z.array(
    z.object({
      studentId: z.string({ message: "StudentId is required." }).min(3, "StudentId should be atleast 3 characters long."),
      status: z.enum(["Present", "Absent"]),
    })
  ),
});

export const UpdateClassAttendanceSchema = z.array(
  z.object({
    id: z.string({ message: "Id is required." }).min(3, "Id should be atleast 3 characters long."),
    studentId: z.string({ message: "StudentId is required." }).min(3, "StudentId should be atleast 3 characters long."),
    status: z.enum(["Present", "Absent"]),
  })
);
