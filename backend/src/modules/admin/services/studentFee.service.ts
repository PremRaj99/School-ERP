import prisma from '@/core/db';
import { DatabaseError, NotFoundError, ValidationError } from '@/core/errors';
import type {
  CreateStudentFeeBody,
  MonthlyPaymentStatus,
  MonthlyStatusSummary,
  PersonMonthEntry,
  SessionFeeDues,
  StudentFeeDetail,
  StudentFeeListQuery,
  StudentFeeRecord,
  StudentFeeSummary,
  StudentMonthlyStatusQuery,
  StudentMonthlyStatusRow,
  UpdateStatusBody,
  UpdateStudentFeeBody,
} from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, LATE_FINE_FEE_TYPE } from '@schoolerp/contracts';
import {
  fromISOMonth,
  monthStartEndFromISO,
  toISODate,
  toISOMonth,
} from '@/shared/helpers/isoDate';
import { ACTIVE_STUDENT_STATUS_FILTER } from '@/shared/helpers/activeStudentFilter';
import { getCurrentSessionYear } from '@/shared/helpers/getCurrentSessionYear';
import {
  matchesStatusFilter,
  paginate,
  paidAtForStatus,
  paidOnFor,
  receiptFieldsFor,
  sessionMonths,
  sessionMonthRange,
  summarizeMonth,
  summarizePerson,
  sessionDueThrough,
} from '@/shared/helpers/financeStatus';
import { nextReceiptNo } from '@/shared/helpers/receiptNo';
import { dueFieldsFor, getFeeSettings } from '@/shared/helpers/feeSettings';
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

    const [studentFees, total, settings] = await Promise.all([
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
      getFeeSettings(),
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
        ...receiptFieldsFor(fee.transaction),
        ...dueFieldsFor(settings, toISOMonth(fee.month), fee.transaction.status),
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  /**
   * Every student relevant to `month` with their fee status for it, including students with no
   * fee record yet (`NotGenerated`). "Relevant" = active and admitted before the month ended, or
   * holding a fee record for that month (so a since-graduated student's history still shows).
   * The summary covers the class/section/session filter; `q` and `status` only narrow the rows.
   */
  static async getMonthlyStatus(query: StudentMonthlyStatusQuery): Promise<{
    data: StudentMonthlyStatusRow[];
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

    const classFilter = {
      ...(query.className ? { className: query.className } : {}),
      ...(query.section ? { section: query.section } : {}),
      ...(query.session ? { session: query.session } : {}),
    };
    const hasClassFilter = Object.keys(classFilter).length > 0;

    const studentSelect = {
      id: true,
      studentId: true,
      firstName: true,
      lastName: true,
      rollNo: true,
      phone: true,
      class: { select: { className: true, section: true, monthlyFee: true } },
    } as const;

    const [rosterStudents, fees, settings] = await Promise.all([
      prisma.student.findMany({
        where: {
          ...ACTIVE_STUDENT_STATUS_FILTER,
          dateOfAdmission: { lt: endDate },
          ...(hasClassFilter ? { class: classFilter } : {}),
        },
        select: studentSelect,
      }),
      prisma.studentFee.findMany({
        where: {
          month: monthDate,
          ...(hasClassFilter ? { student: { class: classFilter } } : {}),
        },
        include: { transaction: true, student: { select: studentSelect } },
      }),
      getFeeSettings(),
    ]);

    const feeByStudent = new Map(fees.map((f) => [f.studentId, f]));
    const students = new Map(rosterStudents.map((s) => [s.id, s]));
    for (const fee of fees) {
      if (!students.has(fee.studentId)) students.set(fee.studentId, fee.student);
    }

    const allRows: StudentMonthlyStatusRow[] = Array.from(students.values()).map((student) => {
      const fee = feeByStudent.get(student.id);
      const status: MonthlyPaymentStatus = fee ? fee.transaction.status : 'NotGenerated';
      return {
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        className: student.class?.className,
        section: student.class?.section,
        rollNo: student.rollNo,
        phone: student.phone,
        status,
        feeId: fee?.id ?? null,
        title: fee?.transaction.title ?? null,
        amount: fee?.transaction.finalAmount ?? null,
        paidOn: fee ? paidOnFor(fee.transaction) : null,
        lateFine: fee ? dueFieldsFor(settings, query.month, fee.transaction.status).lateFine : 0,
        monthlyFee: student.class?.monthlyFee ?? settings.defaultMonthlyFee,
      };
    });

    allRows.sort(
      (a, b) =>
        (a.className ?? '').localeCompare(b.className ?? '', undefined, { numeric: true }) ||
        (a.section ?? '').localeCompare(b.section ?? '') ||
        a.rollNo - b.rollNo,
    );
    if (query.sortDir === 'desc') allRows.reverse();

    const summary = summarizeMonth(
      query.month,
      allRows.map((row) => ({ ...row, expected: row.monthlyFee })),
    );

    const q = query.q?.toLowerCase();
    const filtered = allRows.filter(
      (row) =>
        matchesStatusFilter(row.status, query.status) &&
        (!q ||
          row.studentId.toLowerCase().includes(q) ||
          row.firstName.toLowerCase().includes(q) ||
          (row.lastName ?? '').toLowerCase().includes(q)),
    );

    return { ...paginate(filtered, page, pageSize), summary };
  }

  /** One student's fee status for each month of a session (April -> March). */
  static async getStudentSummary(studentId: string, session?: string): Promise<StudentFeeSummary> {
    const student = await prisma.student.findUnique({
      where: { studentId },
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        rollNo: true,
        dateOfAdmission: true,
        class: { select: { className: true, section: true, session: true, monthlyFee: true } },
      },
    });
    if (!student) {
      throw new NotFoundError('Student not found.');
    }
    const settings = await getFeeSettings();

    const targetSession = session ?? student.class?.session ?? getCurrentSessionYear();
    const months = sessionMonths(targetSession);

    const fees = await prisma.studentFee.findMany({
      where: {
        studentId: student.id,
        month: { gte: fromISOMonth(months[0]!), lte: fromISOMonth(months[11]!) },
      },
      include: { transaction: true },
    });
    const feeByMonth = new Map(fees.map((f) => [toISOMonth(f.month), f]));

    const entries: PersonMonthEntry[] = months.map((month) => {
      const fee = feeByMonth.get(month);
      return {
        month,
        status: fee ? fee.transaction.status : 'NotGenerated',
        recordId: fee?.id ?? null,
        title: fee?.transaction.title ?? null,
        amount: fee?.transaction.finalAmount ?? null,
        paidOn: fee ? paidOnFor(fee.transaction) : null,
      };
    });

    return {
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      className: student.class?.className,
      section: student.class?.section,
      rollNo: student.rollNo,
      session: targetSession,
      months: entries,
      totals: summarizePerson(entries, {
        monthlyAmount: student.class?.monthlyFee ?? settings.defaultMonthlyFee,
        fromMonth: toISOMonth(student.dateOfAdmission),
        throughMonth: sessionDueThrough(targetSession),
      }),
    };
  }

  /**
   * Paid / still-left totals for a whole session up to `sessionDueThrough(session)`. Each month's
   * roster matches `getMonthlyStatus` (active students admitted by that month's end, plus anyone
   * with a fee record that month); a student-month with no fee counts at the student's class fee.
   */
  static async getSessionDues(session?: string): Promise<SessionFeeDues> {
    const targetSession = session ?? getCurrentSessionYear();
    const throughMonth = sessionDueThrough(targetSession);
    const empty: SessionFeeDues = {
      session: targetSession,
      throughMonth,
      paidAmount: 0,
      outstandingAmount: 0,
      notGeneratedCount: 0,
      notGeneratedAmount: 0,
      totalLeft: 0,
      studentsWithDues: 0,
    };
    if (!throughMonth) return empty;

    const months = sessionMonths(targetSession).filter((m) => m <= throughMonth);
    const [students, fees, settings] = await Promise.all([
      prisma.student.findMany({
        where: {
          ...ACTIVE_STUDENT_STATUS_FILTER,
          dateOfAdmission: { lt: monthStartEndFromISO(throughMonth).endDate },
        },
        select: { id: true, dateOfAdmission: true, class: { select: { monthlyFee: true } } },
      }),
      prisma.studentFee.findMany({
        where: {
          month: { gte: fromISOMonth(months[0]!), lte: fromISOMonth(throughMonth) },
        },
        select: {
          studentId: true,
          month: true,
          transaction: { select: { status: true, finalAmount: true } },
        },
      }),
      getFeeSettings(),
    ]);

    const result = { ...empty };
    const withDues = new Set<string>();
    const billed = new Set<string>();
    for (const fee of fees) {
      billed.add(`${fee.studentId}:${toISOMonth(fee.month)}`);
      if (fee.transaction.status === 'Paid') {
        result.paidAmount += fee.transaction.finalAmount;
      } else {
        result.outstandingAmount += fee.transaction.finalAmount;
        withDues.add(fee.studentId);
      }
    }
    for (const student of students) {
      const admitted = toISOMonth(student.dateOfAdmission);
      const fee = student.class?.monthlyFee ?? settings.defaultMonthlyFee;
      for (const month of months) {
        if (month < admitted || billed.has(`${student.id}:${month}`)) continue;
        result.notGeneratedCount += 1;
        result.notGeneratedAmount += fee;
        withDues.add(student.id);
      }
    }
    result.totalLeft = result.outstandingAmount + result.notGeneratedAmount;
    result.studentsWithDues = withDues.size;
    return result;
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
      ...receiptFieldsFor(fee.transaction),
      ...dueFieldsFor(await getFeeSettings(), toISOMonth(fee.month), fee.transaction.status),
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

    if (data.payment) {
      // Same path as marking it Paid afterwards, so the receipt number and audit entry match.
      await this.updateStudentFeeStatus(studentFeeId, { status: 'Paid', ...data.payment }, actor);
      return this.getStudentFeeById(studentFeeId);
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

  /**
   * Marking a fee Paid records how it was paid and gives it a receipt number — the first time only;
   * a fee moved off Paid and back keeps its original number. Moving off Paid clears the payment
   * mode/reference (the receipt number stays reserved).
   */
  static async updateStudentFeeStatus(
    feeId: string,
    { status, paymentMode, paymentRef, lateFine }: UpdateStatusBody,
    actor?: Actor,
  ): Promise<StudentFeeRecord> {
    const fee = await prisma.studentFee.findUnique({ where: { id: feeId } });
    if (!fee) {
      throw new NotFoundError();
    }

    const beforeDetail = await this.getStudentFeeById(feeId);
    const beforeStatus = beforeDetail.status;

    const txn = await prisma.transaction.findUnique({ where: { id: fee.transactionId } });
    if (!txn) {
      throw new NotFoundError();
    }
    const paidAt = paidAtForStatus(status, txn);
    const payment =
      status === 'Paid'
        ? {
            // Re-saving an already-Paid fee without a mode keeps what was recorded.
            paymentMode: paymentMode ?? txn.paymentMode,
            paymentRef: paymentRef || (paymentMode ? null : txn.paymentRef),
            receiptNo: txn.receiptNo ?? (await nextReceiptNo(paidAt ?? new Date())),
          }
        : { paymentMode: null, paymentRef: null };
    await prisma.$transaction(async (tx) => {
      let finalAmount = txn.finalAmount;
      // A late fine collected with the payment becomes its own breakdown line (replacing one from
      // an earlier Paid -> unpaid -> Paid round), so the receipt and totals include it.
      if (status === 'Paid' && lateFine !== undefined) {
        const oldFines = await tx.feeBreakdown.findMany({
          where: { studentFeeId: feeId, feeType: LATE_FINE_FEE_TYPE },
        });
        finalAmount -= oldFines.reduce((sum, f) => sum + f.amount, 0);
        await tx.feeBreakdown.deleteMany({
          where: { studentFeeId: feeId, feeType: LATE_FINE_FEE_TYPE },
        });
        if (lateFine > 0) {
          await tx.feeBreakdown.create({
            data: { studentFeeId: feeId, feeType: LATE_FINE_FEE_TYPE, amount: lateFine },
          });
          finalAmount += lateFine;
        }
      }
      await tx.transaction.update({
        where: { id: fee.transactionId },
        data: { status, paidAt, finalAmount, ...payment },
      });
    });

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
        after: { status, ...payment, ...(lateFine !== undefined ? { lateFine } : {}) },
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
