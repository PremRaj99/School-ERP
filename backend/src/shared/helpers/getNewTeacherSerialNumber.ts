import prisma from "@/core/db";

export const getNewTeacherSerialNumber = async () => {
    const teacher = await prisma.teacher.findFirst({
        orderBy: {
            serialNumber: 'desc'
        },
        select: {
            serialNumber: true
        }
    });

    if (!teacher) {
        return 1;
    }

    return teacher.serialNumber + 1;
};
