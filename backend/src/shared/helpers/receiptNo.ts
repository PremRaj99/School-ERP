import prisma from '@/core/db';
import { Prisma } from '@prisma/client';

/** Indian financial year (April → March) of a date, as "2026-27". */
export const financialYearOf = (date: Date): string => {
  const year = date.getUTCMonth() >= 3 ? date.getUTCFullYear() : date.getUTCFullYear() - 1;
  return `${year}-${String((year + 1) % 100).padStart(2, '0')}`;
};

/**
 * Next fee receipt number for the financial year `paidAt` falls in: "RCT/2026-27/00001", restarting
 * at 1 every April. The counter increment is a single atomic upsert, so two collections at the same
 * moment can't get the same number.
 */
export async function nextReceiptNo(paidAt: Date): Promise<string> {
  const fy = financialYearOf(paidAt);
  const key = `receipt:${fy}`;
  const bump = () =>
    prisma.counter.upsert({
      where: { key },
      create: { key, seq: 1 },
      update: { seq: { increment: 1 } },
    });

  let counter;
  try {
    counter = await bump();
  } catch (error) {
    // Two first-of-the-year upserts racing: one creates the counter, the other hits the unique
    // index — by now the counter exists, so a retry takes the update path.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      counter = await bump();
    } else {
      throw error;
    }
  }
  return `RCT/${fy}/${String(counter.seq).padStart(5, '0')}`;
}
