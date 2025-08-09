import prisma from "@repo/db";

export const getNewStudentSerialNumber = async () => {
    const currentYear = new Date().getFullYear(); // 2025
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    const maxSerialNumberResult = await prisma.student.aggregate({
        _max: {
            serialNumber: true,
        },
        where: {
            dateOfAdmission: {
                gte: startOfYear,
                lt: startOfNextYear,
            },
        }
    })

    const maxSoFar = maxSerialNumberResult._max.serialNumber;
    return (maxSoFar || 0) + 1;
}