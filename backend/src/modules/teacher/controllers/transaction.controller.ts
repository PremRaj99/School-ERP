import prisma from '@/core/db';
import { teacherContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { resolveTeacherId } from '@/core/middlewares/auth.middleware';
import { toISODate, toISOMonth } from '@/shared/helpers/isoDate';

export const getTeacherSalary = defineRoute(teacherContract.salary, async ({ req }) => {
  // Was `req.user?.id` — the User id, not the Teacher id, so this always matched zero rows
  // (ALIGNMENT_PLAN.md 2A/B1).
  const teacherId = await resolveTeacherId(req);

  const teacherSalary = await prisma.teacherSalary.findMany({
    where: { teacherId },
    include: { transaction: true },
  });

  return teacherSalary.map((t) => ({
    id: t.id,
    month: toISOMonth(t.month),
    finalAmount: t.transaction.finalAmount,
    status: t.transaction.status,
    paidAt: toISODate(t.transaction.createdAt),
  }));
});
