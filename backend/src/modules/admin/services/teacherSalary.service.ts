import prisma from '@/core/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/core/errors';
import type {
  CreateTeacherSalaryBody,
  MonthlyPaymentStatus,
  MonthlyStatusSummary,
  PersonMonthEntry,
  TeacherHonorariumSummary,
  TeacherMonthlyStatusQuery,
  TeacherMonthlyStatusRow,
  TeacherSalaryListQuery,
  TeacherSalaryRecord,
  UpdateTeacherSalaryBody,
} from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';
import {
  fromISOMonth,
  monthStartEndFromISO,
  toISODate,
  toISOMonth,
} from '@/shared/helpers/isoDate';
import { getCurrentSessionYear } from '@/shared/helpers/getCurrentSessionYear';
import {
  matchesStatusFilter,
  paginate,
  paidAtForStatus,
  paidOnFor,
  sessionMonths,
  sessionMonthRange,
  summarizeMonth,
  summarizePerson,
} from '@/shared/helpers/financeStatus';
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
      ...(filters.month
        ? { month: fromISOMonth(filters.month) }
        : filters.session
          ? { month: sessionMonthRange(filters.session) }
          : {}),
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

  /**
   * Every teacher relevant to `month` (joined before it ended, or holding a record for it) with
   * their honorarium status, including `NotGenerated` for teachers with no record yet. Same
   * summary/filter split as `AdminStudentFeeService.getMonthlyStatus`.
   */
  static async getMonthlyStatus(query: TeacherMonthlyStatusQuery): Promise<{
    data: TeacherMonthlyStatusRow[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    summary: MonthlyStatusSummary;
  }> {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const monthDate = fromISOMonth(query.month);
    const { endDate } = monthStartEndFromISO(query.month);

    const teacherSelect = {
      id: true,
      teacherId: true,
      firstName: true,
      lastName: true,
      phone: true,
      salaryPerMonth: true,
    } as const;

    const [rosterTeachers, salaries] = await Promise.all([
      prisma.teacher.findMany({
        where: { dateOfJoining: { lt: endDate } },
        select: teacherSelect,
      }),
      prisma.teacherSalary.findMany({
        where: { month: monthDate },
        include: { transaction: true, teacher: { select: teacherSelect } },
      }),
    ]);

    const salaryByTeacher = new Map(salaries.map((s) => [s.teacherId, s]));
    const teachers = new Map(rosterTeachers.map((t) => [t.id, t]));
    for (const salary of salaries) {
      if (!teachers.has(salary.teacherId)) teachers.set(salary.teacherId, salary.teacher);
    }

    const allRows: TeacherMonthlyStatusRow[] = Array.from(teachers.values()).map((teacher) => {
      const salary = salaryByTeacher.get(teacher.id);
      const status: MonthlyPaymentStatus = salary ? salary.transaction.status : 'NotGenerated';
      return {
        teacherId: teacher.teacherId,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        phone: teacher.phone,
        salaryPerMonth: teacher.salaryPerMonth,
        status,
        salaryId: salary?.id ?? null,
        title: salary?.transaction.title ?? null,
        amount: salary?.transaction.finalAmount ?? null,
        paidOn: salary ? paidOnFor(salary.transaction) : null,
      };
    });

    allRows.sort((a, b) => a.firstName.localeCompare(b.firstName));
    if (query.sortDir === 'desc') allRows.reverse();

    const summary = summarizeMonth(query.month, allRows);

    const q = query.q?.toLowerCase();
    const filtered = allRows.filter(
      (row) =>
        matchesStatusFilter(row.status, query.status) &&
        (!q ||
          row.teacherId.toLowerCase().includes(q) ||
          row.firstName.toLowerCase().includes(q) ||
          (row.lastName ?? '').toLowerCase().includes(q)),
    );

    return { ...paginate(filtered, page, pageSize), summary };
  }

  /** One teacher's honorarium status for each month of a session (April -> March). */
  static async getTeacherSummary(
    teacherId: string,
    session?: string,
  ): Promise<TeacherHonorariumSummary> {
    const teacher = await prisma.teacher.findUnique({
      where: { teacherId },
      select: { id: true, teacherId: true, firstName: true, lastName: true, salaryPerMonth: true },
    });
    if (!teacher) {
      throw new NotFoundError('Teacher not found.');
    }

    const targetSession = session ?? getCurrentSessionYear();
    const months = sessionMonths(targetSession);

    const salaries = await prisma.teacherSalary.findMany({
      where: {
        teacherId: teacher.id,
        month: { gte: fromISOMonth(months[0]!), lte: fromISOMonth(months[11]!) },
      },
      include: { transaction: true },
    });
    const salaryByMonth = new Map(salaries.map((s) => [toISOMonth(s.month), s]));

    const entries: PersonMonthEntry[] = months.map((month) => {
      const salary = salaryByMonth.get(month);
      return {
        month,
        status: salary ? salary.transaction.status : 'NotGenerated',
        recordId: salary?.id ?? null,
        title: salary?.transaction.title ?? null,
        amount: salary?.transaction.finalAmount ?? null,
        paidOn: salary ? paidOnFor(salary.transaction) : null,
      };
    });

    return {
      teacherId: teacher.teacherId,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      salaryPerMonth: teacher.salaryPerMonth,
      session: targetSession,
      months: entries,
      totals: summarizePerson(entries),
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

    const txn = await prisma.transaction.findUnique({ where: { id: salary.transactionId } });
    await prisma.transaction.update({
      where: { id: salary.transactionId },
      data: { status, paidAt: txn ? paidAtForStatus(status, txn) : null },
    });

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
