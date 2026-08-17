import prisma from '@/core/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/core/errors';
import { getMonthStartEnd } from '../helpers';
import { CreateStudentFeeInput } from '../types';

export interface StudentFeeFilters {
  studentId?: string;
  className?: string;
  section?: string;
  session?: string;
  month?: string;
  status?: 'Paid' | 'Pending' | 'Failed';
}

export class AdminStudentFeeService {
  static async getStudentFees(filters: StudentFeeFilters) {
    const classFilter = {
      ...(filters.className ? { className: filters.className } : {}),
      ...(filters.section ? { section: filters.section } : {}),
      ...(filters.session ? { session: filters.session } : {}),
    };

    const studentFees = await prisma.studentFee.findMany({
      where: {
        student: {
          ...(filters.studentId ? { studentId: filters.studentId } : {}),
          ...(Object.keys(classFilter).length > 0 ? { class: classFilter } : {}),
        },
        ...(filters.month ? { month: getMonthStartEnd(filters.month).startDate } : {}),
        ...(filters.status ? { transaction: { status: filters.status } } : {}),
      },
      include: {
        transaction: true,
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
            rollNo: true,
            class: { select: { className: true, section: true } },
          },
        },
      },
      orderBy: { month: 'desc' },
    });

    return studentFees.map((fee) => ({
      id: fee.id,
      studentId: fee.student.studentId,
      firstName: fee.student.firstName,
      lastName: fee.student.lastName,
      className: fee.student.class?.className,
      section: fee.student.class?.section,
      rollNo: fee.student.rollNo,
      month: fee.month,
      title: fee.transaction.title,
      finalAmount: fee.transaction.finalAmount,
      status: fee.transaction.status,
      paidAt: fee.transaction.createdAt,
    }));
  }

  static async getStudentFeeById(feeId: string) {
    const fee = await prisma.studentFee.findUnique({
      where: { id: feeId },
      include: {
        transaction: true,
        feeBreakdown: true,
        student: {
          select: {
            studentId: true,
            firstName: true,
            lastName: true,
            rollNo: true,
            class: { select: { className: true, section: true, session: true } },
          },
        },
      },
    });

    if (!fee) {
      throw new NotFoundError();
    }

    return {
      id: fee.id,
      studentId: fee.student.studentId,
      firstName: fee.student.firstName,
      lastName: fee.student.lastName,
      className: fee.student.class?.className,
      section: fee.student.class?.section,
      session: fee.student.class?.session,
      rollNo: fee.student.rollNo,
      month: fee.month,
      title: fee.transaction.title,
      finalAmount: fee.transaction.finalAmount,
      status: fee.transaction.status,
      paidAt: fee.transaction.createdAt,
      feeBreakdown: fee.feeBreakdown.map((b) => ({ feeType: b.feeType, amount: b.amount })),
    };
  }

  static async createStudentFee(data: CreateStudentFeeInput) {
    const student = await prisma.student.findUnique({
      where: { studentId: data.studentId },
    });

    if (!student) {
      throw new NotFoundError('Student not found.');
    }

    const { startDate: month } = getMonthStartEnd(data.month);
    const finalAmount = data.feeBreakdown.reduce((sum, item) => sum + item.amount, 0);

    const existing = await prisma.studentFee.findUnique({
      where: { month_studentId: { month, studentId: student.id } },
    });
    if (existing) {
      throw new ValidationError('A fee record for this student and month already exists.');
    }

    try {
      await prisma.$transaction(async (txn) => {
        const transaction = await txn.transaction.create({
          data: {
            title: data.title ?? `${student.firstName} - Fee - ${data.month}`,
            finalAmount,
            status: 'Pending',
            category: 'Fee',
          },
        });

        const studentFee = await txn.studentFee.create({
          data: {
            studentId: student.id,
            transactionId: transaction.id,
            month,
          },
        });

        await txn.feeBreakdown.createMany({
          data: data.feeBreakdown.map((item) => ({
            studentFeeId: studentFee.id,
            feeType: item.feeType,
            amount: item.amount,
          })),
        });
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError();
    }
  }

  static async updateStudentFeeStatus(feeId: string, status: 'Paid' | 'Pending' | 'Failed') {
    const fee = await prisma.studentFee.findUnique({ where: { id: feeId } });
    if (!fee) {
      throw new NotFoundError();
    }

    await prisma.transaction.update({
      where: { id: fee.transactionId },
      data: { status },
    });
  }

  static async deleteStudentFee(feeId: string) {
    const fee = await prisma.studentFee.findUnique({ where: { id: feeId } });
    if (!fee) {
      throw new NotFoundError();
    }

    try {
      await prisma.$transaction(async (txn) => {
        await txn.studentFee.delete({ where: { id: feeId } });
        await txn.transaction.delete({ where: { id: fee.transactionId } });
      });
    } catch (_e) {
      throw new DatabaseError();
    }
  }
}
