interface RawTimeTableEntry {
    class: {
        className: string;
        section: string;
    };
    teacher: {
        teacherId: string;
        firstName: string;
        lastName: string | null;
    };
    weekday: string;
    subject: {
        subjectName: string;
        subjectCode: string;
    };
    period: number;
}

interface PeriodDetail {
    periodNumber: number;
    subjectCode: string;
    subjectName: string;
    teacherId: string;
    teacherFullName: string;
}

interface FormattedDaySchedule {
    weekday: string;
    periods: PeriodDetail[];
}

interface FormattedClassSchedule {
    className: string;
    section: string;
    schedule: FormattedDaySchedule[];
}

export const timeTableFormattedData = (timeTableEntries: RawTimeTableEntry[]): FormattedClassSchedule[] => {
    const classMap = new Map<string, { className: string; section: string; entries: RawTimeTableEntry[] }>();

    for (const entry of timeTableEntries) {
        const classKey = `${entry.class.className}-${entry.class.section}`;

        if (!classMap.has(classKey)) {
            classMap.set(classKey, {
                className: entry.class.className,
                section: entry.class.section,
                entries: []
            });
        }
        classMap.get(classKey)!.entries.push(entry);
    }

    const weekdaysOrder = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const formattedResults: FormattedClassSchedule[] = [];

    for (const [, classData] of classMap) {
        const dayMap = new Map<string, RawTimeTableEntry[]>();

        for (const entry of classData.entries) {
            if (!dayMap.has(entry.weekday)) {
                dayMap.set(entry.weekday, []);
            }
            dayMap.get(entry.weekday)!.push(entry);
        }

        const schedule: FormattedDaySchedule[] = [];

        for (const day of weekdaysOrder) {
            const entriesForDay = dayMap.get(day);

            if (entriesForDay) {
                entriesForDay.sort((a, b) => a.period - b.period);

                const periods: PeriodDetail[] = entriesForDay.map(entry => ({
                    periodNumber: entry.period,
                    subjectCode: entry.subject.subjectCode,
                    subjectName: entry.subject.subjectName,
                    teacherId: entry.teacher.teacherId,
                    teacherFullName: `${entry.teacher.firstName} ${entry.teacher.lastName ?? ''}`.trim()
                }));

                schedule.push({
                    weekday: day,
                    periods: periods
                });
            }
        }

        formattedResults.push({
            className: classData.className,
            section: classData.section,
            schedule: schedule
        });
    }

    return formattedResults;
};
