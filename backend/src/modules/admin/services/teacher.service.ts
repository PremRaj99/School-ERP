import prisma from '@/core/db';
import { NotFoundError, ValidationError } from '@/core/errors';
import type {
  CreateTeacherBody,
  ResetTeacherPasswordResponse,
  TeacherListQuery,
  TeacherRecord,
  UpdateTeacherBody,
} from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';
import { generateId, generateTemporaryPassword, getNewTeacherSerialNumber } from '../helpers';
import { fromISODate, toISODate } from '@/shared/helpers/isoDate';
import bcrypt from 'bcrypt';

interface PaginatedTeachers {
  data: TeacherRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const teacherSelect = {
  teacherId: true,
  firstName: true,
  lastName: true,
  dob: true,
  gender: true,
  address: true,
  phone: true,
  teacherAadhar: true,
  dateOfJoining: true,
  about: true,
  salaryPerMonth: true,
  qualifications: true,
  subjectHandled: true,
  profilePhoto: true,
  user: { select: { username: true } },
} as const;

type RawTeacher = {
  teacherId: string;
  firstName: string;
  lastName: string | null;
  dob: Date;
  gender: 'Male' | 'Female' | 'Other' | null;
  address: string | null;
  phone: string;
  teacherAadhar: string | null;
  dateOfJoining: Date;
  about: string | null;
  salaryPerMonth: number;
  qualifications: string;
  subjectHandled: string[];
  profilePhoto: string;
  user: { username: string } | null;
};

const toTeacherRecord = (teacher: RawTeacher): TeacherRecord => ({
  teacherId: teacher.teacherId,
  firstName: teacher.firstName,
  lastName: teacher.lastName,
  dob: toISODate(teacher.dob),
  gender: teacher.gender ?? null,
  address: teacher.address,
  phone: teacher.phone,
  teacherAadhar: teacher.teacherAadhar,
  dateOfJoining: toISODate(teacher.dateOfJoining),
  about: teacher.about,
  salaryPerMonth: teacher.salaryPerMonth,
  qualifications: teacher.qualifications,
  subjectHandled: teacher.subjectHandled,
  profilePhoto: teacher.profilePhoto,
  username: teacher.user?.username ?? '',
});

export class AdminTeacherService {
  static async getTeachers(query: TeacherListQuery): Promise<PaginatedTeachers> {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortDir = query.sortDir ?? 'asc';

    const where = query.q
      ? {
          OR: [
            { firstName: { contains: query.q, mode: 'insensitive' as const } },
            { lastName: { contains: query.q, mode: 'insensitive' as const } },
            { teacherId: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const orderBy =
      query.sortBy === 'dateOfJoining'
        ? { dateOfJoining: sortDir }
        : query.sortBy === 'salaryPerMonth'
          ? { salaryPerMonth: sortDir }
          : query.sortBy === 'teacherId'
            ? { teacherId: sortDir }
            : { firstName: sortDir };

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        select: teacherSelect,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.teacher.count({ where }),
    ]);

    return {
      data: teachers.map(toTeacherRecord),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  static async getTeacherById(teacherId: string): Promise<TeacherRecord> {
    const teacher = await prisma.teacher.findUnique({
      where: { teacherId },
      select: teacherSelect,
    });

    if (!teacher) {
      throw new NotFoundError();
    }

    return toTeacherRecord(teacher);
  }

  static async createTeacher(data: CreateTeacherBody): Promise<TeacherRecord> {
    const serialNumber = await getNewTeacherSerialNumber();
    const teacherId = generateId('Teacher', serialNumber);
    const hashPassword = await bcrypt.hash(teacherId, 10);

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            username: teacherId,
            password: hashPassword,
            role: 'Teacher',
          },
        });

        await tx.teacher.create({
          data: {
            serialNumber,
            teacherId,
            firstName: data.firstName,
            lastName: data.lastName,
            dob: fromISODate(data.dob),
            gender: data.gender,
            address: data.address,
            phone: data.phone,
            teacherAadhar: data.teacherAadhar,
            dateOfJoining: fromISODate(data.dateOfJoining),
            about: data.about,
            salaryPerMonth: data.salaryPerMonth,
            qualifications: data.qualifications,
            subjectHandled: data.subjectHandled,
            profilePhoto: data.profilePhoto,
            userId: user.id,
          },
        });
      });
    } catch (e) {
      console.error(e);
      throw new ValidationError();
    }

    return this.getTeacherById(teacherId);
  }

  static async updateTeacher(teacherId: string, data: UpdateTeacherBody): Promise<TeacherRecord> {
    const teacher = await prisma.teacher.findUnique({ where: { teacherId } });

    if (!teacher) {
      throw new NotFoundError();
    }

    try {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          dob: data.dob ? fromISODate(data.dob) : undefined,
          gender: data.gender,
          address: data.address,
          phone: data.phone,
          teacherAadhar: data.teacherAadhar,
          dateOfJoining: data.dateOfJoining ? fromISODate(data.dateOfJoining) : undefined,
          about: data.about,
          salaryPerMonth: data.salaryPerMonth,
          qualifications: data.qualifications,
          subjectHandled: data.subjectHandled,
          profilePhoto: data.profilePhoto,
        },
      });
    } catch (_e) {
      throw new ValidationError();
    }

    return this.getTeacherById(teacherId);
  }

  static async resetPassword(teacherId: string): Promise<ResetTeacherPasswordResponse> {
    const teacher = await prisma.teacher.findUnique({
      where: { teacherId },
      select: { userId: true, user: { select: { username: true } } },
    });
    if (!teacher) {
      throw new NotFoundError();
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashPassword = await bcrypt.hash(temporaryPassword, 10);

    await prisma.user.update({
      where: { id: teacher.userId },
      data: { password: hashPassword },
    });

    return { username: teacher.user?.username ?? teacherId, temporaryPassword };
  }

  static async deleteTeacher(teacherId: string): Promise<{ teacherId: string }> {
    const teacher = await prisma.teacher.findUnique({ where: { teacherId } });

    if (!teacher) {
      throw new NotFoundError();
    }

    // Was `teacher.delete` first, `user.delete` only as a fallback — backwards. `User` is the
    // parent side of the relation (`Teacher.user` has `onDelete: Cascade`), so deleting the User
    // cascades to the Teacher; deleting the Teacher alone does *not* touch the User, leaving an
    // orphan login credential behind that permanently reserves the teacherId as a `username` and
    // blocks ever re-creating a teacher with that same generated id (found live-testing: a
    // teacher created and deleted earlier in the same session made every subsequent create fail
    // with `User_username_key` P2002, since `getNewTeacherSerialNumber()` reissued the same
    // serial and the stale User row was still sitting on that username). Matches
    // `AdminStudentService.deleteStudent`'s already-correct order.
    try {
      await prisma.user.delete({ where: { id: teacher.userId } });
    } catch (_e) {
      try {
        await prisma.teacher.delete({ where: { id: teacher.id } });
      } catch (_err) {
        // ignore
      }
    }

    return { teacherId };
  }
}
