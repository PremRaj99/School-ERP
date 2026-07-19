import prisma from "@/core/db";
import { getCurrentSessionYear } from './getCurrentSessionYear';

export const getGroupedSubject = async () => {
    const currentSessionString = getCurrentSessionYear();

    const [timeTableForCurrentSession, allSubjects] = await Promise.all([
        prisma.timeTable.findMany({
            where: {
                class: {
                    session: currentSessionString
                }
            },
            select: {
                class: {
                    select: {
                        className: true
                    }
                },
                subject: {
                    select: {
                        subjectCode: true,
                        subjectName: true
                    },
                },
                teacher: {
                    select: {
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        }),
        prisma.subject.findMany()
    ]);

    const assignedSubjectCodes = new Set(
        timeTableForCurrentSession.map(entry => entry.subject.subjectCode)
    );

    const unassignedSubjects = allSubjects.filter(
        subject => !assignedSubjectCodes.has(subject.subjectCode)
    );

    const classMap = new Map<string, { className: string; subjects: any[] }>();
    timeTableForCurrentSession.forEach(entry => {
        const className = entry.class.className;
        const subject = entry.subject;

        if (!classMap.has(className)) {
            classMap.set(className, {
                className: className,
                subjects: []
            });
        }
        classMap.get(className)!.subjects.push(subject);
    });

    const groupedByClass = Array.from(classMap.values());

    return {
        assignedSubjects: groupedByClass,
        unassignedSubjects: unassignedSubjects
    };
};
