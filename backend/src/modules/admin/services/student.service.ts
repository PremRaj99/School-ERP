import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import type {
  BulkImportStudentsBody,
  BulkImportStudentsResponse,
  ResetStudentPasswordResponse,
  StudentListQuery,
  StudentRecord,
  UpdateStudentBody,
} from '@schoolerp/contracts';
import { CreateStudentBody, DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';
import {
  ACTIVE_STUDENT_STATUS_FILTER,
  generateId,
  generateTemporaryPassword,
  getNewStudentSerialNumber,
} from '../helpers';
import { fromISODate, toISODate } from '@/shared/helpers/isoDate';
import bcrypt from 'bcrypt';

interface PaginatedStudents {
  data: StudentRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const studentSelect = {
  studentId: true,
  firstName: true,
  lastName: true,
  dob: true,
  address: true,
  phone: true,
  fatherName: true,
  motherName: true,
  fatherOccupation: true,
  motherOccupation: true,
  studentAadhar: true,
  fatherAadhar: true,
  motherAadhar: true,
  dateOfAdmission: true,
  rollNo: true,
  appId: true,
  profilePhoto: true,
  status: true,
  class: { select: { className: true, section: true, session: true } },
  user: { select: { username: true } },
} as const;

type RawStudent = {
  studentId: string;
  firstName: string;
  lastName: string | null;
  dob: Date;
  address: string | null;
  phone: string;
  fatherName: string | null;
  motherName: string | null;
  fatherOccupation: string | null;
  motherOccupation: string | null;
  studentAadhar: string | null;
  fatherAadhar: string | null;
  motherAadhar: string | null;
  dateOfAdmission: Date;
  rollNo: number;
  appId: string | null;
  profilePhoto: string;
  // Genuinely `| undefined` at runtime for a pre-D5 document — see `toStudentRecord`'s fallback.
  status: 'Active' | 'TransferredOut' | 'Graduated' | undefined;
  class: { className: string; section: string; session: string } | null;
  user: { username: string } | null;
};

const toStudentRecord = (student: RawStudent): StudentRecord => ({
  studentId: student.studentId,
  firstName: student.firstName,
  lastName: student.lastName,
  dob: toISODate(student.dob),
  address: student.address,
  phone: student.phone,
  fatherName: student.fatherName,
  motherName: student.motherName,
  fatherOccupation: student.fatherOccupation,
  motherOccupation: student.motherOccupation,
  studentAadhar: student.studentAadhar,
  fatherAadhar: student.fatherAadhar,
  motherAadhar: student.motherAadhar,
  className: student.class?.className ?? '',
  section: student.class?.section ?? '',
  session: student.class?.session ?? '',
  dateOfAdmission: toISODate(student.dateOfAdmission),
  rollNo: student.rollNo,
  appId: student.appId,
  profilePhoto: student.profilePhoto,
  username: student.user?.username ?? '',
  // `?? 'Active'` for the same legacy-document reason as the `notIn` filter above — Prisma
  // returns `undefined` here, not the schema default, for a document with no `status` key.
  status: student.status ?? 'Active',
});

export class AdminStudentService {
  static async getStudents(query: StudentListQuery): Promise<PaginatedStudents> {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortDir = query.sortDir ?? 'asc';

    const classFilter =
      query.className || query.section || query.session
        ? {
            class: {
              ...(query.className ? { className: query.className } : {}),
              ...(query.section ? { section: query.section } : {}),
              ...(query.session ? { session: query.session } : {}),
            },
          }
        : {};

    const searchFilter = query.q
      ? {
          OR: [
            { firstName: { contains: query.q, mode: 'insensitive' as const } },
            { lastName: { contains: query.q, mode: 'insensitive' as const } },
            { studentId: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // D5 — default to the active roster; pass `status` explicitly to see graduated/transferred
    // students (e.g. a class-history lookup). See `ACTIVE_STUDENT_STATUS_FILTER` for why this
    // isn't a plain `{ status: 'Active' }`.
    const statusFilter = query.status ? { status: query.status } : ACTIVE_STUDENT_STATUS_FILTER;

    const where = { ...classFilter, ...searchFilter, ...statusFilter };

    const orderBy =
      query.sortBy === 'firstName'
        ? { firstName: sortDir }
        : query.sortBy === 'dateOfAdmission'
          ? { dateOfAdmission: sortDir }
          : query.sortBy === 'studentId'
            ? { studentId: sortDir }
            : { rollNo: sortDir };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        select: studentSelect,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.student.count({ where }),
    ]);

    return {
      data: students.map(toStudentRecord),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  static async getStudentById(studentId: string): Promise<StudentRecord> {
    const student = await prisma.student.findUnique({
      where: { studentId },
      select: studentSelect,
    });

    if (!student) {
      throw new NotFoundError();
    }

    return toStudentRecord(student);
  }

  static async createStudent(data: CreateStudentBody): Promise<StudentRecord> {
    const classRecord = await prisma.class.findUnique({
      where: {
        className_section_session: {
          className: data.className,
          section: data.section,
          session: data.session,
        },
      },
    });

    if (!classRecord) {
      throw new NotFoundError(
        `Class ${data.className}-${data.section} (${data.session}) does not exist. Create it first.`,
      );
    }

    const serialNumber = await getNewStudentSerialNumber();
    const studentId = generateId('Student', serialNumber);
    const hashPassword = await bcrypt.hash(studentId, 10);

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: studentId,
            password: hashPassword,
            role: 'Student',
          },
        });

        await tx.student.create({
          data: {
            serialNumber,
            studentId,
            firstName: data.firstName,
            lastName: data.lastName,
            dob: fromISODate(data.dob),
            address: data.address,
            phone: data.phone,
            fatherName: data.fatherName,
            motherName: data.motherName,
            fatherOccupation: data.fatherOccupation,
            motherOccupation: data.motherOccupation,
            studentAadhar: data.studentAadhar,
            fatherAadhar: data.fatherAadhar,
            motherAadhar: data.motherAadhar,
            dateOfAdmission: fromISODate(data.dateOfAdmission),
            rollNo: data.rollNo,
            appId: data.appId,
            profilePhoto: data.profilePhoto,
            classId: classRecord.id,
            userId: user.id,
          },
        });
      });
    } catch (e) {
      console.error(e);
      throw new ValidationError(
        'Could not create student — check the roll number is not already taken in this class.',
      );
    }

    return this.getStudentById(studentId);
  }

  static async updateStudent(studentId: string, data: UpdateStudentBody): Promise<StudentRecord> {
    const student = await prisma.student.findUnique({ where: { studentId } });

    if (!student) {
      throw new NotFoundError();
    }

    let classId = student.classId;
    if (data.className && data.section && data.session) {
      const classRecord = await prisma.class.findUnique({
        where: {
          className_section_session: {
            className: data.className,
            section: data.section,
            session: data.session,
          },
        },
      });

      if (!classRecord) {
        throw new NotFoundError(
          `Class ${data.className}-${data.section} (${data.session}) does not exist. Create it first.`,
        );
      }
      classId = classRecord.id;
    }

    try {
      await prisma.student.update({
        where: { id: student.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob ? fromISODate(data.dob) : undefined,
          address: data.address,
          phone: data.phone,
          fatherName: data.fatherName,
          motherName: data.motherName,
          fatherOccupation: data.fatherOccupation,
          motherOccupation: data.motherOccupation,
          studentAadhar: data.studentAadhar,
          fatherAadhar: data.fatherAadhar,
          motherAadhar: data.motherAadhar,
          dateOfAdmission: data.dateOfAdmission ? fromISODate(data.dateOfAdmission) : undefined,
          rollNo: data.rollNo,
          appId: data.appId,
          profilePhoto: data.profilePhoto,
          classId,
        },
      });
    } catch (_e) {
      throw new ValidationError();
    }

    return this.getStudentById(studentId);
  }

  static async resetPassword(studentId: string): Promise<ResetStudentPasswordResponse> {
    const student = await prisma.student.findUnique({
      where: { studentId },
      select: { userId: true, user: { select: { username: true } } },
    });
    if (!student) {
      throw new NotFoundError();
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashPassword = await bcrypt.hash(temporaryPassword, 10);

    await prisma.user.update({
      where: { id: student.userId },
      data: { password: hashPassword },
    });

    return { username: student.user?.username ?? studentId, temporaryPassword };
  }

  /** One row = one `createStudent` call. Partial success — a bad row is reported, not fatal to the
   * rest of the batch (ALIGNMENT_PLAN.md P3, see `BulkImportStudentsBody` for the reasoning). */
  static async bulkImportStudents(
    rows: BulkImportStudentsBody,
  ): Promise<BulkImportStudentsResponse> {
    const created: StudentRecord[] = [];
    const failures: { row: number; message: string }[] = [];

    for (let row = 0; row < rows.length; row++) {
      // Validated here, not by the contract's body schema — see `BulkImportStudentsBody` for why:
      // a schema-level `array(CreateStudentBody)` would 400 the whole request on row 12's typo
      // before any row got processed, defeating the point of per-row partial success.
      const parsed = CreateStudentBody.safeParse(rows[row]);
      if (!parsed.success) {
        failures.push({
          row,
          message: parsed.error.issues.map((issue) => issue.message).join('; '),
        });
        continue;
      }

      try {
        // Sequential, not `Promise.all` — each row must see the previous row's serial-number
        // allocation; running these concurrently would race `getNewStudentSerialNumber()` and
        // could hand out the same serial number twice.
        created.push(await this.createStudent(parsed.data));
      } catch (e) {
        failures.push({
          row,
          message: e instanceof Error ? e.message : 'Could not create student.',
        });
      }
    }

    return {
      successCount: created.length,
      failureCount: failures.length,
      created,
      failures,
    };
  }

  static async deleteStudent(studentId: string): Promise<{ studentId: string }> {
    const student = await prisma.student.findUnique({ where: { studentId } });

    if (!student) {
      throw new NotFoundError();
    }

    try {
      await prisma.user.delete({ where: { id: student.userId } });
    } catch (_e) {
      try {
        await prisma.student.delete({ where: { id: student.id } });
      } catch (_err) {
        // ignore
      }
    }

    return { studentId };
  }
}
