import prisma from "@repo/db";
import { getCurrentSessionYear } from './getCurrentSessionYear';

export const getGroupedSubject = async () => {

    const currentSessionString = getCurrentSessionYear()

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
        prisma.subject.findMany() // Get a complete list of all subjects
    ]);

    // 3. Create a Set of assigned subject codes for quick lookups
    const assignedSubjectCodes = new Set(
        timeTableForCurrentSession.map(entry => entry.subject.subjectCode)
    );

    // 4. Filter allSubjects to find the ones that are unassigned
    const unassignedSubjects = allSubjects.filter(
        subject => !assignedSubjectCodes.has(subject.subjectCode)
    );

    // 5. Group the assigned subjects by class (your original logic, simplified)
    const classMap = new Map();
    timeTableForCurrentSession.forEach(entry => {
        const className = entry.class.className;
        const subject = entry.subject;

        if (!classMap.has(className)) {
            classMap.set(className, {
                className: className,
                subjects: []
            });
        }
        classMap.get(className).subjects.push(subject);
    });

    const groupedByClass = Array.from(classMap.values());

    // 6. Combine the results into a single response object
    return {
        assignedSubjects: groupedByClass,
        unassignedSubjects: unassignedSubjects
    };
}