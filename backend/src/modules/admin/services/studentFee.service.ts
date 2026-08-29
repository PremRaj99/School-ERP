import prisma from '@/core/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/core/errors';
import type {
  CreateStudentFeeBody,
  StudentFeeDetail,
  StudentFeeListQuery,
  StudentFeeRecord,
  UpdateStudentFeeBody,
} from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';
import { fromISOMonth, toISODate, toISOMonth } from '@/shared/helpers/isoDate';
import { FinanceAuditLogService } from './financeAuditLog.service';

interface Actor {
  id: string;
  username: string;
}

interface PaginatedStudentFees {
  data: StudentFeeRecord[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class AdminStudentFeeService {
  static async getStudentFees(filters: StudentFeeListQuery): Promise<PaginatedStudentFees> {
    const page = filters.page ?? DEFAULT_PAGE;
    const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortDir = filters.sortDir ?? 'desc';

    const classFilter = {
      ...(filters.className ? { className: filters.className } : {}),
      ...(filters.section ? { section: filters.section } : {}),
      ...(filters.session ? { session: filters.session } : {}),
    };

    const studentFilter = {
      ...(filters.studentId ? { studentId: filters.studentId } : {}),
      ...(Object.keys(classFilter).length > 0 ? { class: classFilter } : {}),
      ...(filters.q
        ? {
            OR: [
              { firstName: { contains: filters.q, mode: 'insensitive' as const } },
              { lastName: { contains: filters.q, mode: 'insensitive' as const } },
              { studentId: { contains: filters.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const where = {
      student: studentFilter,
      ...(filters.month ? { month: fromISOMonth(filters.month) } : {}),
      ...(filters.status ? { transaction: { status: filters.status } } : {}),
    };

    const orderBy =
      filters.sortBy === 'finalAmount'
        ? { transaction: { finalAmount: sortDir } }
        : filters.sortBy === 'paidAt'
          ? { transaction: { createdAt: sortDir } }
          : { month: sortDir };

    const [studentFees, total] = await Promise.all([
      prisma.studentFee.findMany({
        where,
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
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.studentFee.count({ where }),
    ]);

    return {
      data: studentFees.map((fee) => ({
        id: fee.id,
        studentId: fee.student.studentId,
        firstName: fee.student.firstName,
        lastName: fee.student.lastName,
        className: fee.student.class?.className,
        section: fee.student.class?.section,
        rollNo: fee.student.rollNo,
        month: toISOMonth(fee.month),
        title: fee.transaction.title,
        finalAmount: fee.transaction.finalAmount,
        status: fee.transaction.status,
        paidAt: toISODate(fee.transaction.createdAt),
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  static async getStudentFeeById(feeId: string): Promise<StudentFeeDetail> {
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
      month: toISOMonth(fee.month),
      title: fee.transaction.title,
      finalAmount: fee.transaction.finalAmount,
      status: fee.transaction.status,
      paidAt: toISODate(fee.transaction.createdAt),
      feeBreakdown: fee.feeBreakdown.map((b) => ({ feeType: b.feeType, amount: b.amount })),
    };
  }

  static async createStudentFee(
    data: CreateStudentFeeBody,
    actor?: Actor,
  ): Promise<StudentFeeDetail> {
    const student = await prisma.student.findUnique({ where: { studentId: data.studentId } });
    if (!student) {
      throw new NotFoundError('Student not found.');
    }

    const month = fromISOMonth(data.month);
    const finalAmount = data.feeBreakdown.reduce((sum, item) => sum + item.amount, 0);

    const existing = await prisma.studentFee.findUnique({
      where: { month_studentId: { month, studentId: student.id } },
    });
    if (existing) {
      throw new ValidationError('A fee record for this student and month already exists.');
    }

    let studentFeeId = '';
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
          data: { studentId: student.id, transactionId: transaction.id, month },
        });
        studentFeeId = studentFee.id;

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

    const result = await this.getStudentFeeById(studentFeeId);

    if (actor) {
      await FinanceAuditLogService.log({
        action: 'CREATE',
        entityType: 'StudentFee',
        entityId: studentFeeId,
        actorId: actor.id,
        actorUsername: actor.username,
        after: result,
      });
    }

    return result;
  }

  static async updateStudentFee(
    feeId: string,
    data: UpdateStudentFeeBody,
    actor?: Actor,
  ): Promise<StudentFeeDetail> {
    const before = await this.getStudentFeeById(feeId);

    const fee = await prisma.studentFee.findUnique({ where: { id: feeId } });
    if (!fee) {
      throw new NotFoundError();
    }

    try {
      await prisma.$transaction(async (txn) => {
        // Update month if provided
        if (data.month) {
          const newMonth = fromISOMonth(data.month);
          await txn.studentFee.update({ where: { id: feeId }, data: { month: newMonth } });
        }

        // Update title and/or recalculate amount
        const txnUpdate: { title?: string; finalAmount?: number } = {};
        if (data.title) {
          txnUpdate.title = data.title;
        }
        if (data.feeBreakdown) {
          txnUpdate.finalAmount = data.feeBreakdown.reduce((sum, item) => sum + item.amount, 0);
          // Replace fee breakdown: delete old, create new
          await txn.feeBreakdown.deleteMany({ where: { studentFeeId: feeId } });
          await txn.feeBreakdown.createMany({
            data: data.feeBreakdown.map((item) => ({
              studentFeeId: feeId,
              feeType: item.feeType,
              amount: item.amount,
            })),
          });
        }
        if (Object.keys(txnUpdate).length > 0) {
          await txn.transaction.update({ where: { id: fee.transactionId }, data: txnUpdate });
        }
      });
    } catch (error) {
      if (error instanceof ValidationError) throw error;
      throw new DatabaseError();
    }

    const after = await this.getStudentFeeById(feeId);

    if (actor) {
      await FinanceAuditLogService.log({
        action: 'UPDATE',
        entityType: 'StudentFee',
        entityId: feeId,
        actorId: actor.id,
        actorUsername: actor.username,
        before,
        after,
      });
    }

    return after;
  }

  static async updateStudentFeeStatus(
    feeId: string,
    status: 'Paid' | 'Pending' | 'Failed',
    actor?: Actor,
  ): Promise<StudentFeeRecord> {
    const fee = await prisma.studentFee.findUnique({ where: { id: feeId } });
    if (!fee) {
      throw new NotFoundError();
    }

    const beforeDetail = await this.getStudentFeeById(feeId);
    const beforeStatus = beforeDetail.status;

    await prisma.transaction.update({ where: { id: fee.transactionId }, data: { status } });

    const {
      feeBreakdown: _feeBreakdown,
      session: _session,
      ...record
    } = await this.getStudentFeeById(feeId);

    if (actor) {
      await FinanceAuditLogService.log({
        action: 'UPDATE_STATUS',
        entityType: 'StudentFee',
        entityId: feeId,
        actorId: actor.id,
        actorUsername: actor.username,
        before: { status: beforeStatus },
        after: { status },
      });
    }

    return record;
  }

  static async deleteStudentFee(feeId: string, actor?: Actor): Promise<{ id: string }> {
    const fee = await prisma.studentFee.findUnique({ where: { id: feeId } });
    if (!fee) {
      throw new NotFoundError();
    }

    let beforeSnapshot: StudentFeeDetail | undefined;
    if (actor) {
      beforeSnapshot = await this.getStudentFeeById(feeId);
    }

    try {
      await prisma.$transaction(async (txn) => {
        await txn.studentFee.delete({ where: { id: feeId } });
        await txn.transaction.delete({ where: { id: fee.transactionId } });
      });
    } catch (_e) {
      throw new DatabaseError();
    }

    if (actor && beforeSnapshot) {
      await FinanceAuditLogService.log({
        action: 'DELETE',
        entityType: 'StudentFee',
        entityId: feeId,
        actorId: actor.id,
        actorUsername: actor.username,
        before: beforeSnapshot,
      });
    }

    return { id: feeId };
  }
}
