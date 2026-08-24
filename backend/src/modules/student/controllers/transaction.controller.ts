import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { studentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { resolveStudentId } from '@/core/middlewares/auth.middleware';
import { toISODate, toISOMonth } from '@/shared/helpers/isoDate';

export const getStudentFee = defineRoute(studentContract.fees, async ({ query, req }) => {
  // Was `req.user?.id` — the User id, not the Student id, so this always matched zero rows
  // (ALIGNMENT_PLAN.md 2A/B4).
  const studentId = await resolveStudentId(req);

  const studentFees = await prisma.studentFee.findMany({
    where: { studentId, student: { class: { session: query.year } } },
    include: { transaction: true },
  });

  return studentFees.map((t) => ({
    id: t.id,
    month: toISOMonth(t.month),
    finalAmount: t.transaction.finalAmount,
    status: t.transaction.status,
    paidAt: toISODate(t.transaction.createdAt),
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
    };
  },
);
