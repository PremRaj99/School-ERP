import prisma from '@/core/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/core/errors';
import { getMonthStartEnd } from '../helpers';
import { CreateTeacherSalaryInput } from '../types';

export interface TeacherSalaryFilters {
  teacherId?: string;
  month?: string;
  status?: 'Paid' | 'Pending' | 'Failed';
}

export class AdminTeacherSalaryService {
  static async getTeacherSalaries(filters: TeacherSalaryFilters) {
    const salaries = await prisma.teacherSalary.findMany({
      where: {
        ...(filters.teacherId ? { teacher: { teacherId: filters.teacherId } } : {}),
        ...(filters.month ? { month: getMonthStartEnd(filters.month).startDate } : {}),
        ...(filters.status ? { transaction: { status: filters.status } } : {}),
      },
      include: {
        transaction: true,
        teacher: { select: { teacherId: true, firstName: true, lastName: true } },
      },
      orderBy: { month: 'desc' },
    });

    return salaries.map((salary) => ({
      id: salary.id,
      teacherId: salary.teacher.teacherId,
      firstName: salary.teacher.firstName,
      lastName: salary.teacher.lastName,
      month: salary.month,
      title: salary.transaction.title,
      finalAmount: salary.transaction.finalAmount,
      status: salary.transaction.status,
      paidAt: salary.transaction.createdAt,
    }));
  }

  static async getTeacherSalaryById(salaryId: string) {
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
      month: salary.month,
      title: salary.transaction.title,
      finalAmount: salary.transaction.finalAmount,
      status: salary.transaction.status,
      paidAt: salary.transaction.createdAt,
    };
  }

  static async createTeacherSalary(data: CreateTeacherSalaryInput) {
    const teacher = await prisma.teacher.findUnique({
      where: { teacherId: data.teacherId },
    });

    if (!teacher) {
      throw new NotFoundError('Teacher not found.');
    }

    const { startDate: month } = getMonthStartEnd(data.month);
    const finalAmount = data.amount ?? teacher.salaryPerMonth;

    const existing = await prisma.teacherSalary.findUnique({
      where: { teacherId_month: { teacherId: teacher.id, month } },
    });
    if (existing) {
      throw new ValidationError('A salary record for this teacher and month already exists.');
    }

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

        await txn.teacherSalary.create({
          data: {
            teacherId: teacher.id,
            transactionId: transaction.id,
            month,
          },
        });
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError();
    }
  }

  static async updateTeacherSalaryStatus(salaryId: string, status: 'Paid' | 'Pending' | 'Failed') {
    const salary = await prisma.teacherSalary.findUnique({ where: { id: salaryId } });
    if (!salary) {
      throw new NotFoundError();
    }

    await prisma.transaction.update({
      where: { id: salary.transactionId },
      data: { status },
    });
  }

  static async deleteTeacherSalary(salaryId: string) {
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
  }
}
