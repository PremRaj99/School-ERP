import { z } from 'zod';

/**
 * Shared primitive Zod schemas used across every contract.
 *
 * Date/month convention (locked 2026-08-23, see ALIGNMENT_PLAN.md Part 0/2B/N1):
 * ISO on the wire, both directions. `DD-MM-YYYY` display formatting is a frontend-only concern
 * (see frontend/src/lib/date.ts) and never appears in a request or response body.
 *
 * This intentionally does NOT reuse `backend/src/shared/types.ts` — those primitives are the OLD
 * `DD-MM-YYYY` convention and stay as-is for every module not yet migrated to the contract layer.
 * Once every module is migrated (Phase 3 / 2B), `shared/types.ts` is deleted and everything imports
 * from here instead.
 */

/** Calendar date, no time component: "2026-08-23". */
export const ISODate = z
  .string({ message: 'Date is required.' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date. Please use YYYY-MM-DD format.')
  .refine(
    (value) => {
      const [year, month, day] = value.split('-').map(Number);
      const parsed = new Date(Date.UTC(year!, month! - 1, day!));
      return (
        parsed.getUTCFullYear() === year &&
        parsed.getUTCMonth() === month! - 1 &&
        parsed.getUTCDate() === day
      );
    },
    { message: 'Invalid calendar date.' },
  );

/** Calendar month, no day: "2026-08". */
export const ISOMonth = z
  .string({ message: 'Month is required.' })
  .regex(/^\d{4}-\d{2}$/, 'Invalid month. Please use YYYY-MM format.')
  .refine(
    (value) => {
      const [year, month] = value.split('-').map(Number);
      return month! >= 1 && month! <= 12 && Number.isInteger(year);
    },
    { message: 'Invalid calendar month.' },
  );

export const ObjectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id.');

export const ClassName = z
  .string({ message: 'Class name is required.' })
  .trim()
  .min(1, { message: 'Class name cannot be empty.' })
  .max(3, { message: 'Class name must be 3 characters or less.' });

export const Section = z
  .string({ message: 'Section is required.' })
  .trim()
  .length(1, { message: 'Section must be a single character.' })
  .regex(/^[A-Z]$/, { message: "Section must be a single uppercase letter (e.g., 'A', 'B')." });

export const Session = z
  .string({ message: 'Session is required.' })
  .trim()
  .regex(/^\d{4}-\d{4}$/, {
    message: "Session must be in the format YYYY-YYYY (e.g., '2025-2026').",
  })
  .refine(
    (value) => {
      const [start, end] = value.split('-').map(Number);
      return end === start! + 1;
    },
    { message: 'The end year must be one year after the start year.' },
  );

export const StudentId = z
  .string({ message: 'studentId is required.' })
  .regex(/^STU\d{8}$/, 'Invalid Student ID.');

export const TeacherId = z
  .string({ message: 'teacherId is required.' })
  .regex(/^TCH\d{8}$/, 'Invalid Teacher ID.');

export const SubjectCode = z
  .string({ message: 'Subject code is required.' })
  .trim()
  .min(3, 'Subject code must be at least 3 characters long.')
  .max(10, 'Subject code must be at most 10 characters long.');

export const Phone = z
  .string({ message: 'Phone number is required.' })
  .regex(/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number.');

export const Aadhar = z.string().regex(/^\d{12}$/, 'Invalid Aadhar number.');

export const ProfilePhotoUrl = z.string().url('Please provide a valid URL for the profile photo.');

export const Username = z.string().min(1, 'Username is required.');

// ---- Pagination (ALIGNMENT_PLAN.md 2C/P1) ----------------------------------------------------
//
// Shared shape for a paginated/searchable/sortable list endpoint. `page`/`pageSize` are `optional`
// rather than `.default(...)` — Zod's `.default()` would make the *output* type non-optional
// (`z.infer` sees only what comes out after the default fills in), so every frontend caller would
// be forced to pass them on every call even though omitting them is the whole point. Instead each
// service applies `query.page ?? DEFAULT_PAGE` / `query.pageSize ?? DEFAULT_PAGE_SIZE` itself —
// same pattern this codebase already uses for every other optional query param.
//
// `z.coerce.number()` matters here specifically because query params arrive over HTTP as strings
// (`?page=2`) — every other primitive in this file validates a string as a string; this is the
// first one that has to parse a string into a different output type.

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

/** Extend this with per-resource filters and a `sortBy: z.enum([...])` narrowed to that
 * resource's actual sortable columns — see `contracts/src/admin/student.ts` for the reference
 * usage. */
export const PageQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
  /** Free-text search — same semantics as `<DataTable>`'s client-side global filter, just run
   * server-side now. */
  q: z.string().trim().min(1).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});
export type PageQuery = z.infer<typeof PageQuery>;

/** Wraps `item` in the standard `{ data, page, pageSize, total, totalPages }` envelope every
 * paginated list response uses. */
export function paginatedResponse<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    page: z.number().int(),
    pageSize: z.number().int(),
    total: z.number().int(),
    totalPages: z.number().int(),
  });
}
