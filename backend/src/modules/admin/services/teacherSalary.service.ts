import prisma from '@/core/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/core/errors';
import type {
  CreateTeacherSalaryBody,
  TeacherSalaryListQuery,
  TeacherSalaryRecord,
} from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';
import { fromISOMonth, toISODate, toISOMonth } from '@/shared/helpers/isoDate';

interface PaginatedTeacherSalaries {
  data: TeacherSalaryRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class AdminTeacherSalaryService {
  static async getTeacherSalaries(
    filters: TeacherSalaryListQuery,
  ): Promise<PaginatedTeacherSalaries> {
    const page = filters.page ?? DEFAULT_PAGE;
    const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortDir = filters.sortDir ?? 'desc';

    const teacherFilter = {
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
      ...(filters.q
        ? {
            OR: [
              { firstName: { contains: filters.q, mode: 'insensitive' as const } },
              { lastName: { contains: filters.q, mode: 'insensitive' as const } },
              { teacherId: { contains: filters.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const where = {
      ...(Object.keys(teacherFilter).length > 0 ? { teacher: teacherFilter } : {}),
      ...(filters.month ? { month: fromISOMonth(filters.month) } : {}),
      ...(filters.status ? { transaction: { status: filters.status } } : {}),
    };

    const orderBy =
      filters.sortBy === 'finalAmount'
        ? { transaction: { finalAmount: sortDir } }
        : filters.sortBy === 'paidAt'
          ? { transaction: { createdAt: sortDir } }
          : { month: sortDir };

    const [salaries, total] = await Promise.all([
      prisma.teacherSalary.findMany({
        where,
        include: {
          transaction: true,
          teacher: { select: { teacherId: true, firstName: true, lastName: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.teacherSalary.count({ where }),
    ]);

    return {
      data: salaries.map((salary) => ({
        id: salary.id,
        teacherId: salary.teacher.teacherId,
        firstName: salary.teacher.firstName,
        lastName: salary.teacher.lastName,
        month: toISOMonth(salary.month),
        title: salary.transaction.title,
        finalAmount: salary.transaction.finalAmount,
        status: salary.transaction.status,
        paidAt: toISODate(salary.transaction.createdAt),
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  static async getTeacherSalaryById(salaryId: string): Promise<TeacherSalaryRecord> {
    const salary = await prisma.teacherSalary.findUnique({
      where: { id: salaryId },
      include: {
        transaction: true,
        teacher: { select: { teacherId: true, firstName: true, lastName: true } },
      },
    });

    if (!salary) {
      throw new NotFoundError();
    }

    return {
      id: salary.id,
      teacherId: salary.teacher.teacherId,
      firstName: salary.teacher.firstName,
      lastName: salary.teacher.lastName,
      month: toISOMonth(salary.month),
      title: salary.transaction.title,
      finalAmount: salary.transaction.finalAmount,
      status: salary.transaction.status,
      paidAt: toISODate(salary.transaction.createdAt),
    };
  }

  static async createTeacherSalary(data: CreateTeacherSalaryBody): Promise<TeacherSalaryRecord> {
    const teacher = await prisma.teacher.findUnique({ where: { teacherId: data.teacherId } });
    if (!teacher) {
      throw new NotFoundError('Teacher not found.');
    }

    const month = fromISOMonth(data.month);
    const finalAmount = data.amount ?? teacher.salaryPerMonth;

    const existing = await prisma.teacherSalary.findUnique({
      where: { teacherId_month: { teacherId: teacher.id, month } },
    });
    if (existing) {
      throw new ValidationError('A salary record for this teacher and month already exists.');
    }

    let salaryId = '';
    try {
      await prisma.$transaction(async (txn) => {
        const transaction = await txn.transaction.create({
          data: {
            title: `${teacher.firstName} - Salary - ${data.month}`,
            finalAmount,
            status: 'Pending',
            category: 'Salary',
          },
        });

        const salary = await txn.teacherSalary.create({
          data: { teacherId: teacher.id, transactionId: transaction.id, month },
        });
        salaryId = salary.id;
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError();
    }

    return this.getTeacherSalaryById(salaryId);
  }

  static async updateTeacherSalaryStatus(
    salaryId: string,
    status: 'Paid' | 'Pending' | 'Failed',
  ): Promise<TeacherSalaryRecord> {
    const salary = await prisma.teacherSalary.findUnique({ where: { id: salaryId } });
    if (!salary) {
      throw new NotFoundError();
    }

    await prisma.transaction.update({ where: { id: salary.transactionId }, data: { status } });
    return this.getTeacherSalaryById(salaryId);
  }

  static async deleteTeacherSalary(salaryId: string): Promise<{ id: string }> {
    const salary = await prisma.teacherSalary.findUnique({ where: { id: salaryId } });
    if (!salary) {
      throw new NotFoundError();
    }

    try {
      await prisma.$transaction(async (txn) => {
        await txn.teacherSalary.delete({ where: { id: salaryId } });
        await txn.transaction.delete({ where: { id: salary.transactionId } });
      });
    } catch (_e) {
      throw new DatabaseError();
    }

    return { id: salaryId };
  }
}
