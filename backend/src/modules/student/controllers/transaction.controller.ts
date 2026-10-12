import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { resolveStudentId } from '@/core/middlewares/auth.middleware';
import { toISODate, toISOMonth } from '@/shared/helpers/isoDate';
import { receiptFieldsFor, sessionMonthRange } from '@/shared/helpers/financeStatus';
import { dueFieldsFor, getFeeSettings } from '@/shared/helpers/feeSettings';

export const getStudentFee = defineRoute(studentContract.fees, async ({ query, req }) => {
  // Was `req.user?.id` — the User id, not the Student id, so this always matched zero rows
  // (ALIGNMENT_PLAN.md 2A/B4).
  const studentId = await resolveStudentId(req);

  const settings = await getFeeSettings();
  const studentFees = await prisma.studentFee.findMany({
    // By the fee's month (April -> March of `year`), not the student's current class — a promoted
    // student's previous-session fees belong to that session, not whichever class they're in now.
    where: { studentId, month: sessionMonthRange(query.year) },
    orderBy: { month: 'asc' },
    include: { transaction: true },
  });

  return studentFees.map((t) => ({
    id: t.id,
    month: toISOMonth(t.month),
    finalAmount: t.transaction.finalAmount,
    status: t.transaction.status,
    paidAt: toISODate(t.transaction.createdAt),
    ...receiptFieldsFor(t.transaction),
    ...dueFieldsFor(settings, toISOMonth(t.month), t.transaction.status),
  }));
});

export const getStudentFeeDetail = defineRoute(
  studentContract.feeDetail,
  async ({ params, req }) => {
    const studentId = await resolveStudentId(req);

    const studentFee = await prisma.studentFee.findUnique({
      where: { studentId, id: params.feeId },
      include: {
        transaction: true,
        feeBreakdown: true,
        student: { include: { class: true } },
      },
    });

    if (!studentFee) {
      throw new NotFoundError();
    }

    return {
      id: studentFee.id,
      firstName: studentFee.student.firstName,
      lastName: studentFee.student.lastName,
      className: studentFee.student.class.className,
      section: studentFee.student.class.section,
      session: studentFee.student.class.session,
      rollNo: studentFee.student.rollNo,
      month: toISOMonth(studentFee.month),
      feeBreakdown: studentFee.feeBreakdown.map((b) => ({ feeType: b.feeType, amount: b.amount })),
      finalAmount: studentFee.transaction.finalAmount,
      status: studentFee.transaction.status,
      paidAt: toISODate(studentFee.transaction.createdAt),
      ...receiptFieldsFor(studentFee.transaction),
      ...dueFieldsFor(
        await getFeeSettings(),
        toISOMonth(studentFee.month),
        studentFee.transaction.status,
      ),
      studentId: studentFee.student.studentId,
      title: studentFee.transaction.title,
    };
  },
);
