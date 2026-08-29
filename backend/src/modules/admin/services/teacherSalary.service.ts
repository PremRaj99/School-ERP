import prisma from '@/core/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/core/errors';
import type {
  CreateTeacherSalaryBody,
  TeacherSalaryListQuery,
  TeacherSalaryRecord,
  UpdateTeacherSalaryBody,
} from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';
import { fromISOMonth, toISODate, toISOMonth } from '@/shared/helpers/isoDate';
import { FinanceAuditLogService } from './financeAuditLog.service';

interface Actor {
  id: string;
  username: string;
}

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

  static async createTeacherSalary(
    data: CreateTeacherSalaryBody,
    actor?: Actor,
  ): Promise<TeacherSalaryRecord> {
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

    const result = await this.getTeacherSalaryById(salaryId);

    if (actor) {
      await FinanceAuditLogService.log({
        action: 'CREATE',
        entityType: 'TeacherSalary',
        entityId: salaryId,
        actorId: actor.id,
        actorUsername: actor.username,
        after: result,
      });
    }

    return result;
  }

  static async updateTeacherSalary(
    salaryId: string,
    data: UpdateTeacherSalaryBody,
    actor?: Actor,
  ): Promise<TeacherSalaryRecord> {
    const before = await this.getTeacherSalaryById(salaryId);

    const salary = await prisma.teacherSalary.findUnique({ where: { id: salaryId } });
    if (!salary) {
      throw new NotFoundError();
    }

    try {
      await prisma.$transaction(async (txn) => {
        if (data.month) {
          const newMonth = fromISOMonth(data.month);
          await txn.teacherSalary.update({ where: { id: salaryId }, data: { month: newMonth } });
        }
        if (data.amount !== undefined) {
          await txn.transaction.update({
            where: { id: salary.transactionId },
            data: { finalAmount: data.amount },
          });
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError();
    }

    const after = await this.getTeacherSalaryById(salaryId);

    if (actor) {
      await FinanceAuditLogService.log({
        action: 'UPDATE',
        entityType: 'TeacherSalary',
        entityId: salaryId,
        actorId: actor.id,
        actorUsername: actor.username,
        before,
        after,
      });
    }

    return after;
  }

  static async updateTeacherSalaryStatus(
    salaryId: string,
    status: 'Paid' | 'Pending' | 'Failed',
    actor?: Actor,
  ): Promise<TeacherSalaryRecord> {
    const salary = await prisma.teacherSalary.findUnique({ where: { id: salaryId } });
    if (!salary) {
      throw new NotFoundError();
    }

    const before = await this.getTeacherSalaryById(salaryId);
    const beforeStatus = before.status;

    await prisma.transaction.update({ where: { id: salary.transactionId }, data: { status } });

    const result = await this.getTeacherSalaryById(salaryId);

    if (actor) {
      await FinanceAuditLogService.log({
        action: 'UPDATE_STATUS',
        entityType: 'TeacherSalary',
        entityId: salaryId,
        actorId: actor.id,
        actorUsername: actor.username,
        before: { status: beforeStatus },
        after: { status },
      });
    }

    return result;
  }

  static async deleteTeacherSalary(salaryId: string, actor?: Actor): Promise<{ id: string }> {
    const salary = await prisma.teacherSalary.findUnique({ where: { id: salaryId } });
    if (!salary) {
      throw new NotFoundError();
    }

    let beforeSnapshot: TeacherSalaryRecord | undefined;
    if (actor) {
      beforeSnapshot = await this.getTeacherSalaryById(salaryId);
    }

    try {
      await prisma.$transaction(async (txn) => {
        await txn.teacherSalary.delete({ where: { id: salaryId } });
        await txn.transaction.delete({ where: { id: salary.transactionId } });
      });
    } catch (_e) {
      throw new DatabaseError();
    }

    if (actor && beforeSnapshot) {
      await FinanceAuditLogService.log({
        action: 'DELETE',
        entityType: 'TeacherSalary',
        entityId: salaryId,
        actorId: actor.id,
        actorUsername: actor.username,
        before: beforeSnapshot,
      });
    }

    return { id: salaryId };
  }
}
