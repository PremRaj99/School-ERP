import prisma from '@/core/db';

export const getNewStudentSerialNumber = async () => {
  const student = await prisma.student.findFirst({
    orderBy: {
      serialNumber: 'desc',
    },
    select: {
      serialNumber: true,
    },
  });

  if (!student) {
    return 1;
  }

  return student.serialNumber + 1;
};
