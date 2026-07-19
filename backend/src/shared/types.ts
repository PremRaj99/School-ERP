import { z } from "zod";

// Shared primitive Zod schemas used across multiple modules
export const ObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

export const dateSchema = z.string().refine(
  (date) => {
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) return false;
    const [day, month, year] = date.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day);
    return (
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === day
    );
  },
  { message: "Invalid date. Please use DD-MM-YYYY format." }
);

export const monthSchema = z.string().refine(
  (date) => {
    const dateRegex = /^\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) return false;
    const [month, year] = date.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, 1);
    return (
      parsedDate.getFullYear() === year &&
      parsedDate.getMonth() === month - 1 &&
      parsedDate.getDate() === 1
    );
  },
  { message: "Invalid month. Please use MM-YYYY format." }
);

export const classNameSchema = z
  .string({ message: "Class name is required." })
  .trim()
  .min(1, { message: "Class name cannot be empty." })
  .max(3, { message: "Class name must be 15 characters or less." });

export const sectionSchema = z
  .string({ message: "Section is required." })
  .trim()
  .length(1, { message: "Section must be a single character." })
  .regex(/^[A-Z]$/, { message: "Section must be a single uppercase letter (e.g., 'A', 'B')." });

export const sessionSchema = z
  .string({ message: "Session is required." })
  .trim()
  .regex(/^\d{4}-\d{4}$/, { message: "Session must be in the format YYYY-YYYY (e.g., '2022-2023')." })
  .refine(
    (data) => {
      const years = data.split("-").map(Number);
      return years[1] === years[0] + 1;
    },
    { message: "The end year must be one year after the start year." }
  );
